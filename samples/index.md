## Samples

Each sample below comes with:
- The URL of the RAW log sample, in a `.json` file
  - This is to be used in the **Pipeline**'s **Collection Configuration**
  - **Rick Click** and **Copy** it, then **Paste** it in the **API URL** field of the **Collection Parameters**
- The URL of a pre-configured **Shared Collection Configuration**
  - This is to save you time, or show you how this sample could be used in the **Collection Configuration**
  - If you want to use it:
    - Download it to your local drive
    - Go to the **Pipeline**'s **Properties** page / **Collection** area
    - Click the **Share / Import** button in the right hand side actions panel
    - Select **Import from Local File**
    - Drag and Drop the previously downloaded file (or click the field and search for the file)
    - Click **Import Configuration**
- The URL of a pre-configured **Shared Fields Mapping**
  - This is to save you time, or show you how this sample would look after being tailed and (at least partially) mapped to SIEM fields in the **Fields Mapping** editor
  - If you want to use it:
    - Download it to your local drive
    - Go to the **Pipeline**'s **Properties** page / **Mapping** area
    - Click the **Share / Import** button in the right hand side actions panel
    - Select **Import from Local File**
    - Drag and Drop the previously downloaded file (or click the field and search for the file)
    - Click **Import Fields Mapping**

### Fake simple logs

#### 📃 01.single.json

Contains a single log
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/01.single.json](https://logrhythm.github.io/EZ-Cloud/samples/01.single.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 01.single.json_9456b2e2-731a-495e-a112-b79124807db6.ezCollection](input.EZ Cloud - Samples - 01.single.json_9456b2e2-731a-495e-a112-b79124807db6.ezCollection)
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 01.single.json_9456b2e2-731a-495e-a112-b79124807db6.ezFieldsMapping](input.EZ Cloud - Samples - 01.single.json_9456b2e2-731a-495e-a112-b79124807db6.ezFieldsMapping)

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
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/02.array.json](https://logrhythm.github.io/EZ-Cloud/samples/02.array.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 02.array.json_41b90374-ef13-41e0-bca3-62e5b154cb12.ezCollection](input.EZ Cloud - Samples - 02.array.json_41b90374-ef13-41e0-bca3-62e5b154cb12.ezCollection)
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 02.array.json_41b90374-ef13-41e0-bca3-62e5b154cb12.ezFieldsMapping](input.EZ Cloud - Samples - 02.array.json_41b90374-ef13-41e0-bca3-62e5b154cb12.ezFieldsMapping)

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
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/03.array.with_info.json](https://logrhythm.github.io/EZ-Cloud/samples/03.array.with_info.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 03.array.with_info.json_422ae9b2-bf8a-49a8-999b-5359ba958831.ezCollection](input.EZ Cloud - Samples - 03.array.with_info.json_422ae9b2-bf8a-49a8-999b-5359ba958831.ezCollection)
  - Do note that this **Collection Configuration** properly configures the Beat to extract the messages from the `.logs` field
  - Compare this sample with the one just above to see the difference
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 03.array.with_info.json_422ae9b2-bf8a-49a8-999b-5359ba958831.ezFieldsMapping](input.EZ Cloud - Samples - 03.array.with_info.json_422ae9b2-bf8a-49a8-999b-5359ba958831.ezFieldsMapping)

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
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/04.ndr-single.json](https://logrhythm.github.io/EZ-Cloud/samples/04.ndr-single.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 04.ndr-single.json_dea8bca6-7b7c-4f8b-aea9-4a7ea2ce6cca.ezCollection](input.EZ Cloud - Samples - 04.ndr-single.json_dea8bca6-7b7c-4f8b-aea9-4a7ea2ce6cca.ezCollection)
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 04.ndr-single.json_dea8bca6-7b7c-4f8b-aea9-4a7ea2ce6cca.ezFieldsMapping](input.EZ Cloud - Samples - 04.ndr-single.json_dea8bca6-7b7c-4f8b-aea9-4a7ea2ce6cca.ezFieldsMapping)

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
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/05.ndr-array.json](https://logrhythm.github.io/EZ-Cloud/samples/05.ndr-array.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 05.ndr-array.json_1b050f67-bab2-4c2e-b847-57607294e301.ezCollection](input.EZ Cloud - Samples - 05.ndr-array.json_1b050f67-bab2-4c2e-b847-57607294e301.ezCollection)
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 05.ndr-array.json_1b050f67-bab2-4c2e-b847-57607294e301.ezFieldsMapping](input.EZ Cloud - Samples - 05.ndr-array.json_1b050f67-bab2-4c2e-b847-57607294e301.ezFieldsMapping)

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
- URL: [https://logrhythm.github.io/EZ-Cloud/samples/06.ndr-array.with_info.json](https://logrhythm.github.io/EZ-Cloud/samples/06.ndr-array.with_info.json)
- Pre-configured **Shared Collection Configuration**: [input.EZ Cloud - Samples - 06.ndr-array.with_info.json_bb4fc13e-316e-4571-8649-5b80a586e392.ezCollection](input.EZ Cloud - Samples - 06.ndr-array.with_info.json_bb4fc13e-316e-4571-8649-5b80a586e392.ezCollection)
  - Do note that this **Collection Configuration** properly configures the Beat to extract the messages from the `.logs` field
  - Compare this sample with the one just above to see the difference
- Pre-configured **Shared Fields Mapping**: [input.EZ Cloud - Samples - 06.ndr-array.with_info.json_bb4fc13e-316e-4571-8649-5b80a586e392.ezFieldsMapping](input.EZ Cloud - Samples - 06.ndr-array.with_info.json_bb4fc13e-316e-4571-8649-5b80a586e392.ezFieldsMapping)

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
