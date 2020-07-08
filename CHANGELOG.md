# Changelog
All notable changes to this project will be documented in this file.

## [1.0.0] - 2020-07-08
### Added
- Insertion of the changelog covering all the resources tested in version `<= 2.9.0` of the API-Gateway;
- Tested services:
    - *Account:*
    ```
        - auth
        - users
        - institutions
        - children
        - educators
        - educators.children.groups
        - families
        - family.children
        - healthprofessionals
        - healthprofessionals.children.groups
        - applications
    ``` 
    - *Iot-Tracking:*
    ```
        - children.physicalactivities
        - children.logs
        - children.sleep
        - children.weights
        - children.bodyfats
        - environments (institutions.environments)
    ```   
    - *Missions:*
    ```
        - Robot
        - DSS - Resources unable to test
        - Educator Missions - Only post, Get_id and Get_all were tested
    ```
   - *Questionnaires:*
    ```
        - Q1Sociodemographic
        - Q501PhysicalActivityForChildren
        - Q503SleepingHabits
        - Qfoodtracking
        - Q21ChildsHealthConditions - Only post was tested
    ```
