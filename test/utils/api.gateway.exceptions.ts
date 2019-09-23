import { ApiException } from "../../src/exceptions/api.exception";

export abstract class ApiGatewayException {

    public static readonly AUTH: any = {
        ERROR_400_USERNAME: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: username is required!').toJson(),
        ERROR_400_PASSWORD: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: password is required!').toJson(),
        ERROR_401_INVALID_VALUE: new ApiException(401, 'Invalid username or password!').toJson(),
        ERROR_401_UNAUTHORIZED: new ApiException(401, 'UNAUTHORIZED', 'Authentication failed for lack of authentication credentials.', '/auth').toJson(),
    }

    public static readonly INSTITUTION: any = {
        ERROR_400_TYPE: new ApiException(400, 'Required fields were not provided...', 'Institution validation: type is required!').toJson(),
        ERROR_400_NAME: new ApiException(400, 'Required fields were not provided...', 'Institution validation: name is required!').toJson(),
        ERROR_400_FAILED_CAST_LATITUDE: new ApiException(400, 'Required fields were not provided!', "Institution validation failed: latitude: Cast to Number failed for value \"TEXT\" at path \"latitude\"").toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Some ID provided does not have a valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_HAS_ASSOCIATION: new ApiException(400, 'The institution is associated with one or more users.').toJson(),
        ERROR_400_INSTITUTION_NOT_REGISTERED: new ApiException(400, 'The institution provided does not have a registration.', 'It is necessary that the institution be registered before trying again.').toJson(),
        ERROR_404_INSTITUTION_NOT_FOUND: new ApiException(404, 'Institution not found!', 'Institution not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Institution is already registered!').toJson()
    }

    public static readonly CHILD: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Child validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Child validation: password is required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Child validation: institution is required!').toJson(),
        ERROR_400_GENDER_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Child validation: gender is required!').toJson(),
        ERROR_400_AGE_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Child validation: age is required!').toJson(),
        ERROR_404_CHILD_NOT_FOUND: new ApiException(404, 'Child not found!', 'Child not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Child is already registered!').toJson()
    }

    public static readonly EDUCATOR: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Educator validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Educator validation: password is required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Educator validation: institution is required!').toJson(),
        ERROR_404_EDUCATOR_NOT_FOUND: new ApiException(404, 'Educator not found!', 'Educator not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Educator is already registered!').toJson()
    }

    public static readonly HEALTH_PROFESSIONAL: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: password is required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: institution is required!').toJson(),
        ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND: new ApiException(404, 'Health Professional not found!', 'Health Professional not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Health Professional is already registered!').toJson()
    }

    public static readonly FAMILY: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: password is required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: institution is required!').toJson(),
        ERROR_400_CHILDREN_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Family validation: Collection with children IDs is required!').toJson(),
        ERROR_400_CHILDREN_NOT_REGISTERED: new ApiException(400, 'It is necessary for children to be registered before proceeding.', 'The following IDs were verified without registration:').toJson(),
        ERROR_400_ASSOCIATION_FAILURE: new ApiException(400, 'The association could not be performed because the child does not have a record.').toJson(),
        ERROR_404_FAMILY_NOT_FOUND: new ApiException(404, 'Family not found!', 'Family not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Family is already registered!').toJson()
    }

    public static readonly APPLICATION: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Application validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Application validation: password is required!').toJson(),
        ERROR_400_APPLICATION_NAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Application validation: application_name is required!').toJson(),
        ERROR_404_APPLICATION_NOT_FOUND: new ApiException(404, 'Application not found!', 'Application not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Application is already registered!').toJson()
    }

    public static readonly CHILDREN_GROUPS: any = {
        ERROR_400_NAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Children Group validation: name is required!').toJson(),
        ERROR_400_CHILDREN_IDS_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Children Group validation: Collection with children IDs is required!').toJson(),
        ERROR_400_CHILDREN_NOT_REGISTERED: new ApiException(400, 'It is necessary for children to be registered before proceeding.', 'The following IDs were verified without registration:').toJson(),
        ERROR_404_CHILDREN_GROUP_NOT_FOUND: new ApiException(404, 'Children Group not found!', 'Children Group not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE_CHILDREN_GROUPS: new ApiException(409, 'Children Group is already registered!').toJson()
    }

    public static readonly PHYSICAL_ACTIVITY: any = {
        ERROR_400_NAME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Physical Activity validation failed: name is required!').toJson(),
        ERROR_400_START_TIME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Physical Activity validation failed: start_time is required!').toJson(),
        ERROR_400_END_TIME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Physical Activity validation failed: end_time is required!').toJson(),
        ERROR_400_DURATION_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Physical Activity validation failed: duration is required!').toJson(),
        ERROR_400_CALORIES_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Physical Activity validation failed: calories is required!').toJson(),
        ERROR_400_INVALID_DATE: new ApiException(400, 'Datetime: null, is not in valid ISO 8601 format.', 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ').toJson(),
        ERROR_400_PARAMETERS_NAME_AND_DURATION_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of physical activity failed: name, duration is required!').toJson(),
        ERROR_400_ALL_PARAMETERS_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of physical activity failed: name, start_time, end_time, duration, calories is required!').toJson(),
        ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME: new ApiException(400, 'Date field is invalid...', 'Date validation failed: The end_time parameter can not contain a older date than that the start_time parameter!').toJson(),
        ERROR_400_NEGATIVE_DURATION: new ApiException(400, 'Duration field is invalid...', 'Physical Activity validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_NEGATIVE_CALORIES: new ApiException(400, 'Calories field is invalid...', 'Physical Activity validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_NEGATIVE_STEPS: new ApiException(400, 'Steps field is invalid...', 'Physical Activity validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_INVALID_STEPS: new ApiException(400, 'Steps field is invalid...', 'Physical Activity validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_DURATION_DOES_NOT_MATCH: new ApiException(400, 'Duration field is invalid...', 'Duration validation failed: Activity duration value does not match values passed in start_time and end_time parameters!').toJson(),
        ERROR_400_LEVEL_NAME_IS_INVALID: new ApiException(400, 'Level are not in a format that is supported!', 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.').toJson(),
        ERROR_400_LEVEL_DURATION_IS_NEGATIVE: new ApiException(400, 'Some (or several) duration field of levels array is invalid...', 'Physical Activity Level validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.').toJson(),
        ERROR_400_INVALID_PHYSICAL_ACTIVY_ID: new ApiException(400, 'Parameter {physicalactivity_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.').toJson(),
        ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND: new ApiException(404, 'Physical Activity not found!', 'Physical Activity not found or already removed. A new operation for the same resource is not required!').toJson(),
        ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED: new ApiException(409, 'Physical Activity is already registered...').toJson(),
    }

    public static readonly SLEEP: any = {
        ERROR_400_START_TIME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Activity validation failed: start_time is required!').toJson(),
        ERROR_400_END_TIME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Activity validation failed: end_time is required!').toJson(),
        ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME: new ApiException(400, 'Date field is invalid...', 'Date validation failed: The end_time parameter can not contain a older date than that the start_time parameter!').toJson(),

    }

    public static readonly LOGS: any = {
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.').toJson()
    }

    public static readonly ENVIRONMENT: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {environment_id} is not in valid format!',
        ERROR_400_INSTITUTION_ID_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: institution_id required!').toJson(),
        ERROR_400_LOCATION_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: location required!').toJson(),
        ERROR_400_MEASUREMENTS_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: measurements required!').toJson(),
        ERROR_400_TIMESTAMP_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: timestamp required!').toJson(),
        ERROR_400_INSTITUTION_ID_AND_MEASUREMENTS_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: institution_id, measurements required!').toJson(),
        ERROR_400_TIMESTAMP_AND_LOCATION_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: timestamp, location required!').toJson(),
        ERROR_400_ALL_PARAMETERS_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Validation of environment measurements failed: timestamp, institution_id, location, measurements required!').toJson(),
        ERROR_400_LOCATION_LOCAL_IS_REQUIRED: new ApiException(400, 'Location are not in a format that is supported...', 'Validation of location failed: location local is required!').toJson(),
        ERROR_400_LOCATION_ROOM_IS_REQUIRED: new ApiException(400, 'Location are not in a format that is supported...', 'Validation of location failed: location room is required!').toJson(),
        ERROR_400_INVALID_DATE: new ApiException(400, 'Datetime: null, is not in valid ISO 8601 format.', 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ').toJson(),
        ERROR_400_MEASUREMENT_TYPE_IS_REQUIRED: new ApiException(400, 'Measurement are not in a format that is supported!', 'Validation of measurements failed: measurement type is required!').toJson(),
        ERROR_409_ENVIRONMENT_MEASUREMENT_IS_ALREADY_REGISTERED: new ApiException(409, 'Measurement of environment is already registered...').toJson(),
    }

    public static readonly APP: any = {
        TITLE: 'Tracking Service',
        APP_DESCRIPTION: 'Micro-service for physical activity, sleep and environmental measurements (temperature and humidity).'
    }

    public static readonly USER: any = {
        ERROR_400_OLD_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Change password validation failed: old_password is required!').toJson(),
        ERROR_400_NEW_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Change password validation failed: new_password is required!').toJson(),
        ERROR_400_PASSWORD_NOT_MATCH: new ApiException(400, 'Password does not match!', 'The old password parameter does not match with the actual user password.').toJson(),
        ERROR_404_USER_NOT_FOUND: new ApiException(404, 'User not found!', 'User not found or already removed. A new operation for the same resource is not required.').toJson(),
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...', // not used yet
        NEGATIVE_PARAMETER: 'The value provided has a negative value!', // not used yet
        UUID_NOT_VALID_FORMAT: 'Some ID provided, does not have a valid format!', // not used yet
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.', // not used yet
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Some ID provided does not have a valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_403_FORBIDDEN: new ApiException(403, 'FORBIDDEN', 'Authorization failed due to insufficient permissions.').toJson(),
        ERROR_404_USER_NOT_FOUND: new ApiException(404, 'User not found!', 'User not found or already removed. A new operation for the same resource is not required.').toJson(), // user
        // ERROR_409_UNIQUE_DATA_ALREADY_EXISTS: new ApiException(409, 'A registration with the same unique data already exists!').toJson()
    }
}
