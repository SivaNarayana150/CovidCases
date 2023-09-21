GET http://localhost:3001/state/ 

###

GET http://localhost:3001/state/8/

POST http://localhost:3001/districts/
Content-type:application/json 

{
    
  "districtName": "Bagalkot",
  "stateId": 3,
  "cases": 2323,
  "cured": 2000,
  "active": 315,
  "deaths": 8

}

###

GET http://localhost:3001/districts/322/

###

PUT http://localhost:3001/districts/322/
Content-type:application/json 

{
  "districtName": "Nadia",
  "stateId": 3,
  "cases": 9628,
  "cured": 6524,
  "active": 3000,
  "deaths": 104
}


PUT http://localhost:3001/districts/320/
Content-type:application/json 

{
  "districtName": "Nadia",
  "stateId": 3,
  "cases": 9628,
  "cured": 6524,
  "active": 3000,
  "deaths": 104
}

###

GET http://localhost:3001/states/3/stats/

###


GET http://localhost:3001/districts/322/details/

###