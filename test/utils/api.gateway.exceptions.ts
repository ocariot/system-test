import { ApiException } from "../../src/exceptions/api.exception";

export abstract class ApiGatewayException {

    public static readonly AUTH: any = {
        ERROR_400_USERNAME: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: username is required!').toJson(),
        ERROR_400_PASSWORD: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: password is required!').toJson(),
        ERROR_401_INVALID_VALUE: new ApiException(401, 'Invalid username or password!').toJson(),
        ERROR_401_UNAUTHORIZED: new ApiException(401, 'UNAUTHORIZED', 'Authentication failed for lack of authentication credentials.', '/auth').toJson(),
    }

    public static readonly INSTITUTION: any = {
        ERROR_400_TYPE: new ApiException(400, 'Required fields were not provided...', 'type are required!').toJson(),
        ERROR_400_NAME: new ApiException(400, 'Required fields were not provided...', 'name are required!').toJson(),
        ERROR_400_FAILED_CAST_LATITUDE: new ApiException(400, 'One or more request fields are invalid...', 'latitude must be a string!').toJson(),
        ERROR_400_FAILED_CAST_LONGITUDE: new ApiException(400, 'One or more request fields are invalid...', 'longitude must be a string!').toJson(),
        ERROR_400_INVALID_NAME: new ApiException(400, 'One or more request fields are invalid...', 'name must be a string!').toJson(),
        ERROR_400_INVALID_TYPE: new ApiException(400, 'One or more request fields are invalid...', 'type must be a string!').toJson(),
        ERROR_400_INVALID_ADDRESS: new ApiException(400, 'One or more request fields are invalid...', 'address must be a string!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Some ID provided does not have a valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_HAS_ASSOCIATION: new ApiException(400, 'The institution is associated with one or more users.').toJson(),
        ERROR_400_INSTITUTION_NOT_REGISTERED: new ApiException(400, 'The institution provided does not have a registration.', 'It is necessary that the institution be registered before trying again.').toJson(),
        ERROR_400_INSTITUTION_ID_IS_INVALID: new ApiException(400, 'Parameter {institution_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_404_INSTITUTION_NOT_FOUND: new ApiException(404, 'Institution not found!', 'Institution not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Institution is already registered...').toJson()
    }

    public static readonly CHILD: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'username are required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'password are required!').toJson(),
        ERROR_400_INVALID_USERNAME: new ApiException(400, 'One or more request fields are invalid...', 'username must be a string!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_INSTITUTION_ID: new ApiException(400, 'Parameter {institution_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_GENDER: new ApiException(400, 'One or more request fields are invalid...', 'The names of the allowed genders are: male, female.').toJson(),
        ERROR_400_INVALID_AGE: new ApiException(400, 'One or more request fields are invalid...', 'Age cannot be less than or equal to zero!').toJson(),
        ERROR_400_INVALID_AGE_IS_NOT_A_NUMBER: new ApiException(400, 'One or more request fields are invalid...', 'Provided age is not a valid number!').toJson(),
        ERROR_400_INSTITUTION_NOT_REGISTERED: new ApiException(400, 'The institution provided does not have a registration.', 'It is necessary that the institution be registered before trying again.').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'institution are required!').toJson(),
        ERROR_400_GENDER_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'gender are required!').toJson(),
        ERROR_400_AGE_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'age are required!').toJson(),
        ERROR_404_CHILD_NOT_FOUND: new ApiException(404, 'Child not found!', 'Child not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Child is already registered...').toJson()
    }

    public static readonly EDUCATOR: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'username are required!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {educator_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_USERNAME: new ApiException(400, 'One or more request fields are invalid...', 'username must be a string!').toJson(),
        ERROR_400_INVALID_PASSWORD: new ApiException(400, 'One or more request fields are invalid...', 'password must be a string!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'password are required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'institution are required!').toJson(),
        ERROR_404_EDUCATOR_NOT_FOUND: new ApiException(404, 'Educator not found!', 'Educator not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Educator is already registered...').toJson()
    }

    public static readonly HEALTH_PROFESSIONAL: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: password is required!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {healthprofessional_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Health Professional validation: institution is required!').toJson(),
        ERROR_404_HEALTHPROFESSIONAL_NOT_FOUND: new ApiException(404, 'Health Professional not found!', 'Health Professional not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Health Professional is already registered!').toJson()
    }

    public static readonly FAMILY: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: username is required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: password is required!').toJson(),
        ERROR_400_INSTITUTION_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Family validation: institution is required!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {family_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_FORMAT_ID_CHILD: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_CHILDREN_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Family validation: Collection with children IDs is required!').toJson(),
        ERROR_400_CHILDREN_NOT_REGISTERED: new ApiException(400, 'It is necessary for children to be registered before proceeding.', 'The following IDs were verified without registration:').toJson(),
        ERROR_400_ASSOCIATION_FAILURE: new ApiException(400, 'The association could not be performed because the child does not have a record.').toJson(),
        ERROR_404_FAMILY_NOT_FOUND: new ApiException(404, 'Family not found!', 'Family not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Family is already registered!').toJson()
    }

    public static readonly APPLICATION: any = {
        ERROR_400_USERNAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'username are required!').toJson(),
        ERROR_400_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'password are required!').toJson(),
        ERROR_400_INVALID_INSTITUTION_ID: new ApiException(400, 'Parameter {institution_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {application_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_USERNAME: new ApiException(400, 'One or more request fields are invalid...', 'username must be a string!').toJson(),
        ERROR_400_INVALID_APPLICATION_NAME: new ApiException(400, 'One or more request fields are invalid...', 'application_name must be a string!').toJson(),
        ERROR_400_INVALID_PASSWORD: new ApiException(400, 'One or more request fields are invalid...', 'password must be a string!').toJson(),
        ERROR_400_APPLICATION_NAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'application_name are required!').toJson(),
        ERROR_404_APPLICATION_NOT_FOUND: new ApiException(404, 'Application not found!', 'Application not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Application is already registered...').toJson()
    }

    public static readonly CHILDREN_GROUPS: any = {
        ERROR_400_NAME_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Children Group validation: name is required!').toJson(),
        ERROR_400_CHILDREN_IDS_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Children Group validation: Collection with children IDs is required!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {group_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_CHILDREN_GROUPS_HEALTHPROFESSIONAL_INVALID_ID: new ApiException(400, 'Parameter {healthprofessional_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_CHILDREN_GROUPS_EDUCATOR_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {educator_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_CHILDREN_NOT_REGISTERED: new ApiException(400, 'It is necessary for children to be registered before proceeding.', 'The following IDs were verified without registration:').toJson(),
        ERROR_400_CHILDREN_GROUPS_EDUCATOR_NOT_FOUND: new ApiException(400, 'Educator not found!', 'Educator not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_400_CHILDREN_GROUPS_HEALTHPROFESSIONAL_NOT_FOUND: new ApiException(400, 'Health Professional not found!', 'Health Professional not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_404_CHILDREN_GROUP_NOT_FOUND: new ApiException(404, 'Children Group not found!', 'Children Group not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE_CHILDREN_GROUPS: new ApiException(409, 'Children Group is already registered...').toJson()
    }

    public static readonly PHYSICAL_ACTIVITY: any = {
        // Physical Activity
        ERROR_400_NAME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'name are required!').toJson(),
        ERROR_400_START_TIME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'start_time are required!').toJson(),
        ERROR_400_END_TIME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'end_time are required!').toJson(),
        ERROR_400_DURATION_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'duration are required!').toJson(),
        ERROR_400_CALORIES_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'calories are required!').toJson(),
        ERROR_400_DURATION_AND_NAME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'duration, name are required!').toJson(),
        ERROR_400_ALL_PARAMETERS_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'start_time, end_time, duration, name, calories are required!').toJson(),
        ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME: new ApiException(400, 'One or more request fields are invalid...', 'The end_time parameter can not contain an older date than that the start_time parameter!').toJson(),
        ERROR_400_NEGATIVE_DURATION: new ApiException(400, 'One or more request fields are invalid...', 'duration can\'t be negative!').toJson(),
        ERROR_400_NEGATIVE_CALORIES: new ApiException(400, 'One or more request fields are invalid...', 'calories can\'t be negative!').toJson(),
        ERROR_400_NEGATIVE_STEPS: new ApiException(400, 'One or more request fields are invalid...', 'steps can\'t be negative!').toJson(),
        ERROR_400_DURATION_DOES_NOT_MATCH: new ApiException(400, 'One or more request fields are invalid...', 'duration value does not match values passed in start_time and end_time parameters!').toJson(),
        ERROR_404_PHYSICAL_ACTIVITY_NOT_FOUND: new ApiException(404, 'Physical Activity not found!', 'Physical Activity not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_PHYSICAL_ACTIVITY_IS_ALREADY_REGISTERED: new ApiException(409, 'Physical Activity is already registered...').toJson(),

        // Invalid ID's
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_PHYSICAL_ACTIVY_ID: new ApiException(400, 'Parameter {physicalactivity_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),

        // Levels Array
        ERROR_400_LEVEL_NAME_IN_INVALID_FORMAT: new ApiException(400, 'One or more request fields are invalid...', 'The levels array must have values for the following levels: sedentary, lightly, fairly, very.').toJson(),
        ERROR_400_LEVEL_NAME_NOT_ALLOWED: new ApiException(400, 'One or more request fields are invalid...', 'The names of the allowed levels are: sedentary, lightly, fairly, very.').toJson(),
        ERROR_400_LEVEL_DURATION_ARE_NEGATIVE: new ApiException(400, 'One or more request fields are invalid...', 'levels.duration can\'t be negative!').toJson(),

        // heart_rate
        ERROR_400_ALL_PARAMETERS_OF_HEART_RATE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'heart_rate.average, heart_rate.out_of_range_zone, heart_rate.fat_burn_zone, heart_rate.cardio_zone, heart_rate.peak_zone are required!').toJson(),
        ERROR_400_HEART_RATE_AVERAGE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'heart_rate.average are required!').toJson(),
        ERROR_400_HEART_RATE_NEGATIVE_AVERAGE: new ApiException(400, 'One or more request fields are invalid...', 'heart_rate.average can\'t be negative!').toJson(),
        ERROR_400_HEART_RATE_CARDIO_ZONE_NEGATIVE_DURATION: new ApiException(400, 'One or more request fields are invalid...', 'heart_rate.cardio_zone.duration can\'t be negative!').toJson(),
        ERROR_400_HEART_RATE_FAT_BURN_ZONE_NEGATIVE_MIN: new ApiException(400, 'One or more request fields are invalid...', 'heart_rate.fat_burn_zone.min can\'t be negative!').toJson(),
        ERROR_400_HEART_RATE_FAT_BURN_ZONE_NEGATIVE_DURATION: new ApiException(400, 'One or more request fields are invalid...', 'heart_rate.fat_burn_zone.duration can\'t be negative!').toJson(),
        ERROR_400_HEART_RATE_OUT_OF_RANGE_ZONE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'heart_rate.out_of_range_zone.min are required!').toJson(),
        ERROR_400_HEART_RATE_PEAK_ZONE_DURATION_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'heart_rate.peak_zone.duration are required!').toJson(),
        ERROR_400_HEART_RATE_PEAK_ZONE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'heart_rate.peak_zone are required!').toJson(),

        // Activity.update has been deprecated
        // ERROR_400_ATTRIBUTES_NOT_UPDATEABLE: new ApiException(400, 'Unable to update this attribute.', 'Updateable attributes are: name, calories, steps, distance, levels (only if the update is from an empty array) and heart_rate.').toJson(),
        // ERROR_400_NEGATIVE_DISTANCE: new ApiException(400, 'One or more request fields are invalid...', 'distance can\'t be negative!').toJson(),
        // ERROR_400_NEGATIVE_AVERAGE: new ApiException(400, 'One or more request fields are invalid...', 'average can\'t be negative!').toJson(),
        // ERROR_400_INVALID_DISTANCE: new ApiException(400, 'One or more request fields are invalid...', 'distance must be a valid number!').toJson(),
        // ERROR_400_INVALID_AVERAGE: new ApiException(400, 'One or more request fields are invalid...', 'average calories must be a valid number!').toJson(),
        // ERROR_400_HEART_RATE_DURATION_IS_INVALID: new ApiException(400, 'Duration field is invalid...', 'HeartRateZone validation failed: The value provided is not a valid number!').toJson(),
        // ERROR_400_HEART_RATE_MAX_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'HeartRateZone validation failed: max is required!').toJson(),
        // ERROR_400_INVALID_CALORIES: new ApiException(400, 'One or more request fields are invalid...', 'calories must be a valid number!').toJson(),
    }

    public static readonly LOGS: any = {
        ERROR_400_DATE_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Child log validation failed: date is required!').toJson(),
        ERROR_400_VALUE_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Child log validation failed: value is required!').toJson(),
        ERROR_400_DATE_AND_VALUE_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'Child log validation failed: date, value is required!').toJson(),
        ERROR_400_VALUE_NEGATIVE: new ApiException(400, 'Value field is invalid...', 'Child log validation failed: The value provided has a negative value!').toJson(),
        ERROR_400_VALUE_IS_NOT_A_NUMBER: new ApiException(400, 'Value field is invalid...', 'Child log validation failed: The value provided is not a valid number!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_CHILD_NOT_FOUND: new ApiException(400, 'Child not found!', 'Child not found or already removed. A new operation for the same resource is not required.').toJson(),
    }

    public static readonly SLEEP: any = {
        // Sleep
        ERROR_400_START_TIME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'start_time are required!').toJson(),
        ERROR_400_END_TIME_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'end_time are required!').toJson(),
        ERROR_400_DURATION_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'duration are required!').toJson(),
        ERROR_400_START_TIME_IS_GREATER_THAN_END_TIME: new ApiException(400, 'One or more request fields are invalid...', 'The end_time parameter can not contain an older date than that the start_time parameter!').toJson(),
        ERROR_400_NEGATIVE_DURATION: new ApiException(400, 'One or more request fields are invalid...', 'duration can\'t be negative!').toJson(),
        ERROR_400_INVALID_DURATION: new ApiException(400, 'One or more request fields are invalid...', 'duration must be a valid number!').toJson(),
        ERROR_400_DURATION_DOES_NOT_MATCH: new ApiException(400, 'One or more request fields are invalid...', 'duration value does not match values passed in start_time and end_time parameters!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_SLEEP_ID: new ApiException(400, 'Parameter {sleep_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_404_SLEEP_NOT_FOUND: new ApiException(404, 'Sleep not found!', 'Sleep not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_SLEEP_IS_ALREADY_REGISTERED: new ApiException(409, 'Sleep is already registered...').toJson(),

        // sleep pattern.data_set
        ERROR_400_PATTERN_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'pattern are required!').toJson(),
        ERROR_400_PATTERN_NAME_NOT_ALLOWED: new ApiException(400, 'One or more request fields are invalid...', 'The names of the allowed data_set patterns are: asleep, restless, awake.').toJson(),
        ERROR_400_NEGATIVE_DURATION_OF_SLEEP_PATTERN_DATASET: new ApiException(400, 'One or more request fields are invalid...', 'pattern.data_set.duration can\'t be negative!').toJson(),
        ERROR_400_INVALID_PATTERN_DATASET_NAME_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'pattern.data_set.name are required!').toJson(),
        ERROR_400_INVALID_PATTERN_DATASET_DURATION_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'pattern.data_set.duration are required!').toJson(),
        ERROR_400_INVALID_PATTERN_DATASET_DURATION_IS_INVALID: new ApiException(400, 'One or more request fields are invalid...', 'pattern.data_set.duration must be a valid number!').toJson(),
    }

    public static readonly WEIGHTS: any = {
        ERROR_400_TIMESTAMP_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp are required!').toJson(),
        ERROR_400_VALUE_AND_UNIT_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'value, unit are required!').toJson(),
        ERROR_400_VALUE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'value are required!').toJson(),
        ERROR_400_UNIT_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'unit are required!').toJson(),
        ERROR_400_INVALID_VALUE: new ApiException(400, 'One or more request fields are invalid...', 'value must be a valid number!').toJson(),
        ERROR_400_INVALID_BODY_FAT_VALUE: new ApiException(400, 'One or more request fields are invalid...', 'body_fat.value must be a valid number!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_WEIGHT_ID: new ApiException(400, 'Parameter {weight_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_NEGATIVE_VALUE: new ApiException(400, 'One or more request fields are invalid...', 'value can\'t be negative!').toJson(),
        ERROR_400_BODY_FAT_VALUE_IS_NEGATIVE: new ApiException(400, 'One or more request fields are invalid...', 'body_fat.value can\'t be negative!').toJson(),
        ERROR_400_EMPTY_UNIT: new ApiException(400, 'One or more request fields are invalid...', 'unit must have at least one character!').toJson(),
        ERROR_404_WEIGHT_NOT_FOUND: new ApiException(404, 'Weight not found!', 'Weight not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_WEIGHT_IS_ALREADY_REGISTERED: new ApiException(409, 'Weight is already registered...').toJson(),

    }

    public static readonly BODYFATS: any = {
        ERROR_400_TIMESTAMP_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp are required!').toJson(),
        ERROR_400_VALUE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'value are required!').toJson(),
        ERROR_400_TIMESTAMP_AND_VALUE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp, value are required!').toJson(),
        ERROR_400_INVALID_VALUE: new ApiException(400, 'One or more request fields are invalid...', 'value must be a valid number!').toJson(),
        ERROR_400_NEGATIVE_VALUE: new ApiException(400, 'One or more request fields are invalid...', 'value can\'t be negative!').toJson(),
        ERROR_400_INVALID_CHILD_ID: new ApiException(400, 'Parameter {child_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_INVALID_BODYFAT_ID: new ApiException(400, 'Parameter {bodyfat_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_DATE_IS_NULL: new ApiException(400, 'Datetime: null, is not in valid ISO 8601 format.', 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ').toJson(),
        ERROR_409_BODYFATS_IS_ALREADY_REGISTERED: new ApiException(409, 'Body Fat is already registered...').toJson(),
        ERROR_404_BODYFAT_NOT_FOUND: new ApiException(404, 'Body Fat not found!', 'Body Fat not found or already removed. A new operation for the same resource is not required.').toJson(),
    }

    public static readonly ENVIRONMENTS: any = {
        // environments
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {environment_id} is not in valid format!',
        ERROR_400_ALL_PARAMETERS_IS_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp, institution_id, location, measurements are required!').toJson(),
        ERROR_400_TIMESTAMP_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp are required!').toJson(),
        ERROR_400_INSTITUTION_ID_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'institution_id are required!').toJson(),
        ERROR_400_INSTITUTION_ID_AND_MEASUREMENTS_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'institution_id, measurements are required!').toJson(),
        ERROR_400_TIMESTAMP_AND_LOCATION_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'timestamp, location are required!').toJson(),
        ERROR_400_INVALID_CLIMATIZED: new ApiException(400, 'One or more request fields are invalid...', 'climatized must be a boolean!').toJson(),
        ERROR_400_INVALID_DATE: new ApiException(400, 'Datetime: null, is not in valid ISO 8601 format.', 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ').toJson(),
        ERROR_400_INVALID_ID: new ApiException(400, 'Parameter {environment_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_409_ENVIRONMENT_MEASUREMENT_IS_ALREADY_REGISTERED: new ApiException(409, 'Environment is already registered...').toJson(),

        // location
        ERROR_400_INVALID_LOCATION_LOCAL: new ApiException(400, 'One or more request fields are invalid...', 'location.local must be a string!').toJson(),
        ERROR_400_INVALID_LOCATION_LATITUDE: new ApiException(400, 'One or more request fields are invalid...', 'location.latitude must be a string!').toJson(),
        ERROR_400_INVALID_LOCATION_ROOM: new ApiException(400, 'One or more request fields are invalid...', 'location.room must be a string!').toJson(),
        ERROR_400_LOCATION_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'location are required!').toJson(),
        ERROR_400_LOCATION_LOCAL_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'location.local are required!').toJson(),
        ERROR_400_LOCATION_ROOM_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'location.room are required!').toJson(),

        // measurements
        ERROR_400_INVALID_MEASUREMENTS_UNIT: new ApiException(400, 'One or more request fields are invalid...', 'measurements.unit must be a string!').toJson(),
        ERROR_400_INVALID_MEASUREMENTS_TYPE: new ApiException(400, 'One or more request fields are invalid...', 'measurements.type must be a string!').toJson(),
        ERROR_400_MEASUREMENT_VALUE_FIELD_IS_INVALID: new ApiException(400, 'One or more request fields are invalid...', 'measurements.value must be a valid number!').toJson(),
        ERROR_400_MEASUREMENTS_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'measurements are required!').toJson(),
        ERROR_400_MEASUREMENT_TYPE_ARE_REQUIRED: new ApiException(400, 'Required fields were not provided...', 'measurements.type are required!').toJson(),
    }

    public static readonly APP: any = {
        TITLE: 'Tracking Service',
        APP_DESCRIPTION: 'Micro-service for physical activity, sleep and environmental measurements (temperature and humidity).'
    }

    public static readonly USER: any = {
        ERROR_400_OLD_PASSWORD_NOT_PROVIDED: new ApiException(400, 'Required fields were not provided...', 'Change password validation failed: old_password is required!').toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Parameter {user_id} is not in valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
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
    }
}
