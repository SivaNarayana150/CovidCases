const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "covid19India.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log(
        "Server Running Successfully At http://localhost:3001/covid19India.db"
      );
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

const convertDatabaseToResponse = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};
const convertDatabaseToResponseSpecificId = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//API 1 Returns a list of all states in the state table
app.get("/states/", async (request, response) => {
  const returnStatesQuery = `SELECT * FROM state`;
  const dbResponse = await db.all(returnStatesQuery);
  response.send(
    dbResponse.map((eachState) => convertDatabaseToResponse(eachState))
  );
});

//API 2 Returns a state based on the state ID

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const gettingSpecifiedStateByIdQuery = `SELECT
     * 
     FROM 
     state 
     WHERE state_id=${stateId};
    `;
  const stateRequired = await db.get(gettingSpecifiedStateByIdQuery);
  response.send(convertDatabaseToResponseSpecificId(stateRequired));
});

//API 3 Create a district in the district table
app.post("/districts/", async (request, response) => {
  const { districtDetails } = request.body;

  const {
    districtId,
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const postNewDistrictQuery = `
    INSERT INTO 
    district
    (district_id,district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtId}','${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}');`;
  const dbResponse = await db.run(postNewDistrictQuery);
  response.send("District Successfully Added");
});

//API 4 Returns a district based on the district ID
const convertDistrictObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getSpecifiedDistrict = `
    SELECT * 
    FROM 
    district 
    WHERE district_id=${districtId};`;
  const districtResponse = await db.get(getSpecifiedDistrict);
  response.send(convertDistrictObject(districtResponse));
});

// API 5 Deletes a district from the district table based on the district ID

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const DeleteQuery = `
    DELETE 
    FROM district 
    WHERE district_id=${districtId};`;
  await db.run(DeleteQuery);
  response.send("District Removed");
});

// API 6 Updates the details of a specific district based on the district ID

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const updateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = updateDetails;
  const updateQuery = `
    UPDATE 
    district SET district_name='${districtName}',
    state_id='${stateId}',
    cases='${cases}',
    cured='${cured}',
    active='${active}',
    deaths='${deaths}';
    `;
  await db.run(updateQuery);
  response.send("District Details Updated");
});

// API 7 Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const queryToGetStats = `
    SELECT SUM(cases) ,
    SUM(cured) ,
    SUM(active) ,
    SUM(deaths) 
    FROM state
    WHERE state_id=${stateId};
    `;
  const dbResponse = await db.get(queryToGetStats);
  response.send({
    totalCases: dbResponse["SUM(cases)"],
    totalCured: dbResponse["SUM(cured)"],
    totalActive: dbResponse["SUM(active)"],
    totalDeaths: dbResponse["SUM(deaths)"],
  });
});

//Returns an object containing the state name of a district based on the district ID

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    SELECT state_id FROM district
    WHERE district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery);
  const getStateNameQuery = `
    SELECT state_name AS stateName FROM state
    WHERE state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await db.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
