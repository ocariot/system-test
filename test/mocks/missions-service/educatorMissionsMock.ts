export class EducatorMissionsMock {

    public id?: number
    public creatorId?: string
    public type?: string
    public goal?: Array<any>
    public description?: Array<any>
    public durationType?: string
    public durationNumber?: number
    public childRecommendation?: Array<any>
    public parentRecommendation?: Array<any>

    constructor(type?: string) {
        this.generateEducatorMissions(type)
    }

    private generateEducatorMissions(type?: string) {
        if (!type) type = this.generateType()

        this.creatorId = this.generateObjectId()
        this.type = type
        this.goal = this.generateGoal(type)
        this.description = this.generateDescription(type)
        this.durationType = 'Week'
        this.durationNumber = 2
        this.childRecommendation = this.generateChildRecommendation(type)
        this.parentRecommendation = this.generateParentRecommendation(type)
    }

    private generateParentRecommendation(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "Go to the supermarket with your child" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ με τα παι" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado con sus hijos y " }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado com seus filhos e " } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Go with your child to a market or a t" }, // English
                    { "locale": "el", "text": "Πηγαίνετε με το παιδί σας σε μια αγορ" }, // Greek
                    { "locale": "es", "text": "Vaya con su hijo a un mercado o una f" }, // Spanish
                    { "locale": "pt", "text": "Vá com seu filho a um mercado ou a um" } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return []
            default:
                return [
                    { "locale": "en", "text": "Go to the supermarket with your child" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ με τα παι" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado con sus hijos y " }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado com seus filhos e " } // Portuguese
                ]
        }
    }

    private generateChildRecommendation(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "Go to the supermarket to the cereal s" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de " }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado na seção de cereai" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Select 3 different fruits and cut the" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de " }, // Spanish
                    { "locale": "pt", "text": "Selecione 3 frutas diferentes e corte" } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return [
                    { "locale": "en", "text": "Remember! Your wearable is measuring " }, // English
                    { "locale": "el", "text": "Θυμάμαι! Το φορετό σας μετρά το επίπε" }, // Greek
                    { "locale": "es", "text": "¡Recuerda! Su dispositivo portátil mi" }, // Spanish
                    { "locale": "pt", "text": "Lembre-se! Seu dispositivo vestível e" } // Portuguese
                ]
            default:
                return [
                    { "locale": "en", "text": "Go to the supermarket to the cereal s" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de " }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado na seção de cereai" } // Portuguese
                ]
        }
    }

    private generateDescription(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "You have to increase the number of da" }, // English
                    { "locale": "el", "text": "Πρέπει να αυξήσετε τον αριθμό των ημε" }, // Greek
                    { "locale": "es", "text": "Debe aumentar la cantidad de días que" }, // Spanish
                    { "locale": "pt", "text": "Você precisa aumentar o número de dia" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Consume 3 or more different fruits th" }, // English
                    { "locale": "el", "text": "Καταναλώστε 3 ή περισσότερα διαφορετι" }, // Greek
                    { "locale": "es", "text": "¡Consume 3 o más frutas diferentes es" }, // Spanish
                    { "locale": "pt", "text": "Consuma 3 ou mais frutas diferentes e" } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return [
                    { "locale": "en", "text": "You have to reduce screen time at Tv " }, // English
                    { "locale": "el", "text": "Πρέπει να μειώσετε την ώρα της οθόνης" }, // Greek
                    { "locale": "es", "text": "Debe reducir el tiempo de pantalla en" }, // Spanish
                    { "locale": "pt", "text": "Você precisa reduzir o tempo na tela " } // Portuguese
                ]
            default:
                return [
                    { "locale": "en", "text": "You have to increase the number of da" }, // English
                    { "locale": "el", "text": "Πρέπει να αυξήσετε τον αριθμό των ημε" }, // Greek
                    { "locale": "es", "text": "Debe aumentar la cantidad de días que" }, // Spanish
                    { "locale": "pt", "text": "Você precisa aumentar o número de dia" } // Portuguese
                ]
        }
    }

    private generateGoal(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "Never skip breakfast" }, // English
                    { "locale": "el", "text": "Ποτέ μην παραλείπετε το πρωινό" }, // Greek
                    { "locale": "es", "text": "Nunca te saltes el desayuno" }, // Spanish
                    { "locale": "pt", "text": "Nunca pule o café da manhã" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Consume variety of fruits." }, // English
                    { "locale": "el", "text": "Καταναλώστε ποικιλία φρούτων." }, // Greek
                    { "locale": "es", "text": "Consume variedad de frutas." }, // Spanish
                    { "locale": "pt", "text": "Consuma variedade de frutas." } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return [
                    { "locale": "en", "text": "Decrease number of hours in sedentary" }, // English
                    { "locale": "el", "text": "Μειώστε τον αριθμό των ωρών στις καθι" }, // Greek
                    { "locale": "es", "text": "Disminuir el número de horas en compo" }, // Spanish
                    { "locale": "pt", "text": "Diminuir o número de horas em comport" } // Portuguese
                ]
            default:
                return [
                    { "locale": "en", "text": "Never skip breakfast" }, // English
                    { "locale": "el", "text": "Ποτέ μην παραλείπετε το πρωινό" }, // Greek
                    { "locale": "es", "text": "Nunca te saltes el desayuno" }, // Spanish
                    { "locale": "pt", "text": "Nunca pule o café da manhã" } // Portuguese
                ]
        }
    }

    private generateType(): string {
        switch (Math.floor((Math.random() * 3))) { // 0-2
            case 0:
                return QuestionnaireType.DIET
            case 1:
                return QuestionnaireType.EDUCATION
            case 2:
                return QuestionnaireType.EDUCATION
            default:
                return QuestionnaireType.DIET
        }
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    public fromJSON(educatorMissions: EducatorMissionsMock) {
        const JSON = {
            id: educatorMissions.id,
            creatorId: educatorMissions.creatorId,
            type: educatorMissions.type,
            goal: educatorMissions.goal,
            description: educatorMissions.description,
            durationType: educatorMissions.durationType,
            durationNumber: educatorMissions.durationNumber,
            childRecommendation: educatorMissions.childRecommendation,
            parentRecommendation: educatorMissions.parentRecommendation
        }

        return JSON
    }
}

export enum QuestionnaireType {
    DIET = 'Diet',
    PHYSICAL_ACTIVITY = 'PhysicalActivity',
    EDUCATION = 'Education'
}