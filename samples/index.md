## Samples

### Fake simple logs

#### 📃 01.single.json

Contains a single log
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/01.single.json](https://tonymasse.github.io/EZ-Cloud/samples/01.single.json)

``` json
{
  "timestamp":"20210422T16:40:00",
  "destination":{
    "ip":"172.16.1.2",
    "port":443
  },
  "source":{
    "ip":"192.168.0.1",
    "port":44444
  }
}
```

#### 📃 02.array.json

Contains a single array of 3 logs
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/02.array.json](https://tonymasse.github.io/EZ-Cloud/samples/02.array.json)

``` json
[
  {
    "timestamp":"20210422T16:40:00",
    "destination":{
      "ip":"172.16.1.2",
      "port":443
    },
    "source":{
      "ip":"192.168.0.1",
      "port":7458
    }
  },
  {
    "timestamp":"20210422T16:42:00",
    "destination":{
      "ip":"172.16.6.48",
      "port":80
    },
    "source":{
      "ip":"192.168.0.1",
      "port":8745
    }
  },
  {
    "timestamp":"20210422T16:43:00",
    "destination":{
      "ip":"172.16.6.48",
      "port":443
    },
    "source":{
      "ip":"192.168.0.1",
      "port":8967
    }
  }
]
```


#### 📃 03.array.with_info.json

Contains a single object, providing information (page number, details about the result set) and an array of 3 logs
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/03.array.with_info.json](https://tonymasse.github.io/EZ-Cloud/samples/03.array.with_info.json)

``` json
{
  "page":1,
  "results":{
    "count":3,
    "awesome":"You damn bet!"
  },
  "logs":[
    {
      "timestamp":"20210422T16:40:00",
      "destination":{
        "ip":"172.16.1.2",
        "port":443
      },
      "source":{
        "ip":"192.168.0.1",
        "port":7458
      }
    },
    {
      "timestamp":"20210422T16:42:00",
      "destination":{
        "ip":"172.16.6.48",
        "port":80
      },
      "source":{
        "ip":"192.168.0.1",
        "port":8745
      }
    },
    {
      "timestamp":"20210422T16:43:00",
      "destination":{
        "ip":"172.16.6.48",
        "port":443
      },
      "source":{
        "ip":"192.168.0.1",
        "port":8967
      }
    }
  ]
}
```

***

### NDR logs

#### 📃 04.ndr-single.json

Contains a single log
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/04.ndr-single.json](https://tonymasse.github.io/EZ-Cloud/samples/04.ndr-single.json)

``` json
{
  "admin_state":"CaseOpen",
  "active":false,
  "case_detail":"We have detected an unexpected user activity. We recommend investigating this activity as it might lead to an unauthorized access to sensitive resources.",
  "case_id":5807,
  "ioa":[
    {
      "created_at":1607575294000,
      "columns":{
        
      },
      "community_id":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=",
...many nested objects, including array...
  "casescore":0,
  "determination":"",
  "note":""
}
```

#### 📃 05.ndr-array.json

Contains a single array of 3 logs
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/05.ndr-array.json](https://tonymasse.github.io/EZ-Cloud/samples/05.ndr-array.json)

``` json
[
  {
    "admin_state":"CaseOpen",
    "active":false,
    "case_detail":"We have detected an unexpected user activity. We recommend investigating this activity as it might lead to an unauthorized access to sensitive resources.",
    "case_id":5807,
    "ioa":[
      {
        "created_at":1607575294000,
        "columns":{
        
        },
        "community_id":"1:TfsKeaK8YkFz2q0zzwCXuSqZxl4=",
...many nested objects, including array...
    "casescore":0,
    "determination":"",
    "note":""
  }
]
```


#### 📃 06.ndr-array.with_info.json

Contains a single object, providing information (page number, details about the result set) and an array of 3 logs
- URL: [https://tonymasse.github.io/EZ-Cloud/samples/06.ndr-array.with_info.json](https://tonymasse.github.io/EZ-Cloud/samples/06.ndr-array.with_info.json)

``` json
{
  "page":1,
  "results":{
    "count":25,
    "awesome":"You damn bet!",
    "source":"XDR"
  },
  "logs":[
    {
      "admin_state":"CaseOpen",
      "active":false,
      "case_detail":"We have detected an unexpected user activity. We recommend investigating this activity as it might lead to an unauthorized access to sensitive resources.",
      "case_id":5807,
      "case_summary":"Anomalous activity Unusual JA3 fingerprint, when compared to similar hosts has been detected by 10.1.6.5",
      "category":"Anomalous Activity",
      "certainty":99,
      "incident_info":{
...many nested objects, including array...
      },
      "casescore":0,
      "determination":"",
      "note":""
    }
  ]
}
```
