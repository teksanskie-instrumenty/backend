## Docker Deployment
For Windows deployment it's recommended to download Docker Desktop

#### Step 1:

`docker-compose -f docker-compose.yml up -d`

#### Step 2:

`docker build -t rest_api .`

`docker run -p 3001:3001 --name rest_api -d rest_api`

#### in order to check mosquitto logs:

`sudo docker logs -f rest_api`

`sudo nano /var/log/mosquitto/mosquitto.log`

[Deployment Tutorial](https://medium.com/@tomer.klein/docker-compose-and-mosquitto-mqtt-simplifying-broker-deployment-7aaf469c07ee)

#### mosquitto.conf:
```
listener 1883
password_file /etc/mosquitto/passwd
allow_anonymous false
```

# Usage

## User Management

`POST /api/signup`

```json
{
  "formFields": [
    {
      "id": "nick",
      "value": "Test"
    },
    {
      "id": "email",
      "value": "test@gmail.com"
    },
    {
      "id": "password",
      "value": "Test123!"
    }
  ]
}
```

`POST /api/signin`

```json
{
  "formFields": [
    {
      "id": "email",
      "value": "test@gmail.com"
    },
    {
      "id": "password",
      "value": "Test123!"
    }
  ]
}
```

`GET /api/user-info`

```json
{
    "id": "350f4342-c94a-4292-8306-3b8637c2c7a2",
    "nick": "Test",
    "card_id": null
}
```

`PATCH /api/user-info`

```json
{
  "nick": "Test1",
  "card_id": "AN3W4324N43TSA"
}
```

`POST /api/signout`
```json
{
  "status": "OK"
}
```

## Daily Plan Management

`GET /api/daily-plan`

```json
[
  {
    "id": 2,
    "name": "Zdrowe plecy",
    "description": "Ulecz ból pleców",
    "image": "./plecy.png"
  }
]
```

`GET /api/daily-plan/:id`

// TODO: add exercises to the example response
#### response
```json
{
  "dailyPlan": {
    "id": 2,
    "name": "Zdrowe plecy",
    "description": "Ulecz ból pleców",
    "image": "./plecy.png"
  },
  "dailyPlanExercises": [
    {
      "id": 3,
      "order": 1,
      "sets": 3,
      "repetitions": 10,
      "interval": 60,
      "exercise": null
    },
    {
      "id": 2,
      "order": 1,
      "sets": 3,
      "repetitions": 10,
      "interval": 60,
      "exercise": null
    }
  ]
}
```

`POST /api/daily-plan`

#### payload

```json
{
  "name": "Zdrowe plecy",
  "desc": "Ulecz ból pleców",
  "img": "./plecy.png"
}
```

#### response

```json
{
  "name": "Zdrowe plecy",
  "description": "Ulecz ból pleców",
  "image": "./plecy.png",
  "id": 2
}
```

## Daily Plan Exercise Management

`POST /api/daily-plan/exercise`

#### payload
```json
{
  "order": 1,
  "repetitions": 10,
  "sets": 3,
  "interval": 60,
  "daily_plan_id": 2
}
```

#### response
```json
{
  "order": 1,
  "repetitions": 10,
  "sets": 3,
  "interval": 60,
  "dailyPlan": {
    "id": 2,
    "name": "Zdrowe plecy",
    "description": "Ulecz ból pleców",
    "image": "./plecy.png"
  },
  "id": 3
}
```

`GET /api/daily-plan/exercise/:id`

```json
{
  "id": 1,
  "order": 1,
  "sets": 20,
  "repetitions": 10,
  "interval": 5
}
```

## Exercise Management

`GET /api/exercises`

```json
[
  {
    "id": 1,
    "station_id": 1,
    "name": "plecy 1",
    "pace": "3040"
  }
]
```

`POST /api/exercise`

#### payload
```json
{
  "station_id": "1",
  "name": "plecy 1",
  "pace": "3040"
}
```

#### response
```json
{
  "station_id": "1",
  "name": "plecy 1",
  "pace": "3040",
  "id": 1
}
```

## Finished Exercise Management

`GET /api/finished-exercises`

```json
[
  {
    "id": 1,
    "user_id": "350f4342-c94a-4292-8306-3b8637c2c7a2",
    "when_finished": "2022-03-01T10:00:00.000Z"
  }
]
```

`POST /api/finished-exercise`
#### payload
```json
{
  "exercise_id": 1,
  "when_finished": "2022-03-01T10:00:00Z"
}
```

#### response
```json
{
    "user_id": "350f4342-c94a-4292-8306-3b8637c2c7a2",
    "dailyPlanExercise": {
        "id": 1,
        "order": 1,
        "sets": 20,
        "repetitions": 10,
        "interval": 5
    },
    "when_finished": "2022-03-01T10:00:00.000Z",
    "id": 1
}
```

## Weekly Plan Management

`GET /api/weekly-plan`

```json
{
  "id": 1,
  "monday": {
    "id": 2,
    "name": "Zdrowe plecy",
    "description": "Ulecz ból pleców",
    "image": "./plecy.png"
  },
  "tuesday": null,
  "wednesday": null,
  "thursday": null,
  "friday": null,
  "saturday": null,
  "sunday": null
}
```

`POST /api/weekly-plan`

#### response
```json
{
  "user": {
    "id": "350f4342-c94a-4292-8306-3b8637c2c7a2"
  },
  "id": 1
}
```

`PATCH /api/weekly-plan`
#### payload
```json
{
  "monday": 1
}
```

#### response
```json
{
"id": 1,
"monday": 2
}
```

## Station Management

`GET /api/stations`

```json
[
  {
    "id": 1,
    "name": "maszyna do robiena plecow",
    "color": "FF0000"
  }
]
```

`POST /api/station`

#### payload
```json
{
  "name": "maszyna do robiena plecow",
  "color": "FF0000"
}
```

#### response
```json
{
  "name": "maszyna do robiena plecow",
  "color": "FF0000",
  "id": 1
}
```
