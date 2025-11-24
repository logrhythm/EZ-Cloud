This related to the way arrays and its item are shown on step 5, depending upon how fanout arrays are selected on step 3 on schema rule screen.
 When the array is selected for fanout in step, on step 5 :
    - There is no change the way Json tree is displayed as it is. There is no change.
    - When fanout is not selected the Json path label is shown same way as it is showing
    - When fanout is selected the values will shown as per blow example

    Json Data: 
    
```json
{
  "projectId": 2001,
  "projectName": "DemoProject",
  "teamMembers": [
    {
      "id": 1,
      "name": "Manish",
      "role": "Developer",
      "contact": {
        "email": "manish@example.com",
        "phone": "+1-555-1234",
        "tasks": [
          {
            "taskId": "T001",
            "title": "Setup Environment",
            "status": "Completed",
            "details": {
              "assignedTo": "Manish",
              "estimatedHours": 4
            }
          },
          {
            "taskId": "T002",
            "title": "API Testing",
            "status": "In Progress",
            "details": {
              "assignedTo": "Aisha",
              "estimatedHours": 6
            }
          }
        ]
      }
    },
    {
      "id": 2,
      "name": "Aisha",
      "role": "Tester",
      "contact": {
        "email": "aisha@example.com",
        "phone": "+1-555-5678",
        "tasks": [
          {
            "taskId": "T001",
            "title": "Setup Environment",
            "status": "Completed",
            "details": {
              "assignedTo": "Manish",
              "estimatedHours": 4
            }
          },
          {
            "taskId": "T002",
            "title": "API Testing",
            "status": "In Progress",
            "details": {
              "assignedTo": "Aisha",
              "estimatedHours": 6
            }
          }
        ]
      }
    }
  ]
}
```


- Let say in above example teamMembers is Selected for Fanout, name is selected for mapping on step 5 in task array, the Json path label shown will $.name, the path will relative to parrent array and the fanout element text box value will be $.teamMembers, parent Json Arrray attribute
- Let say the user has selected the teamMembers and task array both for fanout on step , if I create mapping for title on steps he Json path label will be $.title and fanout parent element will $.tasks, immediate parent .
Let say teamMembers is selected and tasks in not slelected for fanout at step 3, the user slelects title for mapping, the Json path label will be $.tasks[*].title and fanout parent will $.teamMembers
IF no fanout is selected, the Json path for title will $.teamMembers[*].tasks[*].title