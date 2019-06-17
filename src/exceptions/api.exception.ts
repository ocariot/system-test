export class ApiException extends Error {
    /**
     * Creates an instance of ApiException.
     *
     * @param code HTTP status code
     * @param message Short message
     * @param description Detailed message
     * @param redirect_link link for redirect
     */
    constructor(public code: number, public message: string, public description?: string, public redirect_link?: string) {
        super(message)
        this.message = message
        this.code = code
        this.description = description
        this.redirect_link = redirect_link
    }

    /**
     * Mounts default error message.
     * 
     * @return Object
     */
    public toJson(): object {
        if(this.description){
            if(this.redirect_link) 
                return { code: this.code, message: this.message, description: this.description, redirect_link: this.redirect_link }
            else
                return { code: this.code, message: this.message, description: this.description }
        } else 
            return { code: this.code, message: this.message, }
    }
}
