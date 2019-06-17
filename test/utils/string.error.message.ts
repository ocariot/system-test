import { ApiException } from "../../src/exceptions/api.exception";

export abstract class Strings {

    public static readonly AUTH: any = {
        ERROR_400_USERNAME: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: username is required!').toJson(),
        ERROR_400_PASSWORD: new ApiException(400, 'Required fields were not provided...', 'Authentication validation: password is required!').toJson(),
        ERROR_401: new ApiException(401, 'Invalid username or password!').toJson()
    }

    public static readonly INSTITUTION: any = {
        ERROR_400_TYPE: new ApiException(400, 'Required fields were not provided...', 'Institution validation: type is required!').toJson(),
        ERROR_400_NAME: new ApiException(400, 'Required fields were not provided...', 'Institution validation: name is required!').toJson(),
        ERROR_400_FAILED_CAST_LATITUDE: new ApiException(400, 'Required fields were not provided!', "Institution validation failed: latitude: Cast to Number failed for value \"TEXT\" at path \"latitude\"").toJson(),
        ERROR_400_INVALID_FORMAT_ID: new ApiException(400, 'Some ID provided does not have a valid format!', 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.').toJson(),
        ERROR_400_HAS_ASSOCIATION: new ApiException(400, 'The institution is associated with one or more users.').toJson(),
        ERROR_401_UNAUTHORIZED: new ApiException(401, 'UNAUTHORIZED', 'Authentication failed for lack of authentication credentials.', '/auth').toJson(),
        ERROR_403_FORBIDDEN: new ApiException(403, 'FORBIDDEN', 'Authorization failed due to insufficient permissions.').toJson(),
        ERROR_404_INSTITUTION_NOT_FOUND: new ApiException(404, 'Institution not found!', 'Institution not found or already removed. A new operation for the same resource is not required.').toJson(),
        ERROR_409_DUPLICATE: new ApiException(409, 'Institution is already registered!').toJson()
    }

    public static readonly CHILD: any = {
        ERROR_409: new ApiException(409, 'Parameter {child_id} is not in valid format!')
    }

    public static readonly PHYSICAL_ACTIVITY: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {physicalactivity_id} is not in valid format!'
    }

    public static readonly SLEEP: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {sleep_id} is not in valid format!'
    }

    public static readonly ENVIRONMENT: any = {
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {environment_id} is not in valid format!'
    }

    public static readonly APP: any = {
        TITLE: 'Tracking Service',
        APP_DESCRIPTION: 'Micro-service for physical activity, sleep and environmental measurements (temperature and humidity).'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        NEGATIVE_PARAMETER: 'The value provided has a negative value!',
        UUID_NOT_VALID_FORMAT: 'Some ID provided, does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea, is expected.'
    }
}
