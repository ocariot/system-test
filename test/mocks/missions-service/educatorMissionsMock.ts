export class EducatorMissionsMock {

    public id?: number
    public creatorId?: string
    public type?: string
    public goal?: Array<any>
    public description?: Array<any>
    public durationType?: string
    public durationNumber?: string
    public childRecommendation?: Array<any>
    public parentRecommendation?: Array<any>

    constructor(type?: string) {
        this.generateEducatorMissions(type)
    }

    private generateEducatorMissions(type?: string) {
        if (!type) type = this.generateType()

        this.id = 1
        this.creatorId = this.generateObjectId()
        this.type = type
        this.goal = this.generateGoal(type)
        this.description = this.generateDescription(type)
        this.durationType = 'Week'
        this.durationNumber = '2'
        this.childRecommendation = this.generateChildRecommendation(type)
        this.parentRecommendation = this.generateParentRecommendation(type)
    }

    private generateParentRecommendation(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "Go to the supermarket with your children and help him to select a whole grain version of bread, free of sugar added. You can try oatmel mixed with plain yogurt and fresh fruit!" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ με τα παιδιά σας και να τον βοηθήσετε να επιλέξετε μια ολόκληρη έκδοση σιτηρών ψωμί, χωρίς πρόσθετα ζάχαρη. Μπορείτε να δοκιμάσετε oatmel αναμειγνύεται με απλό γιαούρτι και φρέσκα φρούτα!" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado con sus hijos y ayúdelo a seleccionar una versión integral de pan, sin azúcar agregada. ¡Puedes probar la avena mezclada con yogur natural y fruta fresca!" }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado com seus filhos e ajude-o a selecionar uma versão de pão integral, sem adição de açúcar. Você pode experimentar aveia misturada com iogurte natural e frutas frescas!" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Go with your child to a market or a traditional fruit store. Explain the different fruits and vegetables and choose more than 3 different options for the weekly-meals" }, // English
                    { "locale": "el", "text": "Πηγαίνετε με το παιδί σας σε μια αγορά ή ένα παραδοσιακό κατάστημα φρούτων. Εξηγήστε τα διάφορα φρούτα και λαχανικά και επιλέξτε περισσότερες από 3 διαφορετικές επιλογές για τα εβδομαδιαία γεύματα" }, // Greek
                    { "locale": "es", "text": "Vaya con su hijo a un mercado o una frutería tradicional. Explique las diferentes frutas y verduras y elija más de 3 opciones diferentes para las comidas semanales." }, // Spanish
                    { "locale": "pt", "text": "Vá com seu filho a um mercado ou a uma loja de frutas tradicional. Explique as diferentes frutas e legumes e escolha mais de 3 opções diferentes para as refeições semanais" } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return []
            default:
                return [
                    { "locale": "en", "text": "Go to the supermarket with your children and help him to select a whole grain version of bread, free of sugar added. You can try oatmel mixed with plain yogurt and fresh fruit!" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ με τα παιδιά σας και να τον βοηθήσετε να επιλέξετε μια ολόκληρη έκδοση σιτηρών ψωμί, χωρίς πρόσθετα ζάχαρη. Μπορείτε να δοκιμάσετε oatmel αναμειγνύεται με απλό γιαούρτι και φρέσκα φρούτα!" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado con sus hijos y ayúdelo a seleccionar una versión integral de pan, sin azúcar agregada. ¡Puedes probar la avena mezclada con yogur natural y fruta fresca!" }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado com seus filhos e ajude-o a selecionar uma versão de pão integral, sem adição de açúcar. Você pode experimentar aveia misturada com iogurte natural e frutas frescas!" } // Portuguese
                ]
        }
    }

    private generateChildRecommendation(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "Go to the supermarket to the cereal section to select a whole-grain option of bread or cereal. Combine it with fruit or yogurt without sugar!" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα δημητριακών για να επιλέξετε μια επιλογή ολόκληρου των σιτηρών ψωμί ή δημητριακά. Συνδυάστε το με φρούτα ή γιαούρτι χωρίς ζάχαρη!" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de cereales para seleccionar una opción integral de pan o cereal. ¡Combínalo con fruta o yogur sin azúcar!" }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado na seção de cereais para selecionar uma opção de grãos integrais de pão ou cereais. Combine com frutas ou iogurte sem açúcar!" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Select 3 different fruits and cut them in pieces. Put them in a bowl or tapper and keep it in the fridge." }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα δημητριακών για να επιλέξετε μια επιλογή ολόκληρου των σιτηρών ψωμί ή δημητριακά. Συνδυάστε το με φρούτα ή γιαούρτι χωρίς ζάχαρη!" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de cereales para seleccionar una opción integral de pan o cereal. ¡Combínalo con fruta o yogur sin azúcar!" }, // Spanish
                    { "locale": "pt", "text": "Selecione 3 frutas diferentes e corte-as em pedaços. Coloque-os em uma tigela ou vasilha e deixe na geladeira." } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return [
                    { "locale": "en", "text": "Remember! Your wearable is measuring your level of physical activity so be fair and follow the recommendations!" }, // English
                    { "locale": "el", "text": "Θυμάμαι! Το φορετό σας μετρά το επίπεδο φυσικής σας δραστηριότητας, ώστε να είστε δίκαιοι και να ακολουθείτε τις συστάσεις!" }, // Greek
                    { "locale": "es", "text": "¡Recuerda! Su dispositivo portátil mide su nivel de actividad física, ¡así que sea justo y siga las recomendaciones!" }, // Spanish
                    { "locale": "pt", "text": "Lembre-se! Seu dispositivo vestível está medindo seu nível de atividade física, portanto seja justo e siga as recomendações!" } // Portuguese
                ]
            default:
                return [
                    { "locale": "en", "text": "Go to the supermarket to the cereal section to select a whole-grain option of bread or cereal. Combine it with fruit or yogurt without sugar!" }, // English
                    { "locale": "el", "text": "Πηγαίνετε στο σούπερ μάρκετ στο τμήμα δημητριακών για να επιλέξετε μια επιλογή ολόκληρου των σιτηρών ψωμί ή δημητριακά. Συνδυάστε το με φρούτα ή γιαούρτι χωρίς ζάχαρη!" }, // Greek
                    { "locale": "es", "text": "Vaya al supermercado a la sección de cereales para seleccionar una opción integral de pan o cereal. ¡Combínalo con fruta o yogur sin azúcar!" }, // Spanish
                    { "locale": "pt", "text": "Vá ao supermercado na seção de cereais para selecionar uma opção de grãos integrais de pão ou cereais. Combine com frutas ou iogurte sem açúcar!" } // Portuguese
                ]
        }
    }

    private generateDescription(type): Array<any> {
        switch (type) {
            case QuestionnaireType.DIET:
                return [
                    { "locale": "en", "text": "You have to increase the number of days having breakfast to 7 a week" }, // English
                    { "locale": "el", "text": "Πρέπει να αυξήσετε τον αριθμό των ημερών που έχουν πρωινό έως 7 την εβδομάδα" }, // Greek
                    { "locale": "es", "text": "Debe aumentar la cantidad de días que desayuna a 7 por semana." }, // Spanish
                    { "locale": "pt", "text": "Você precisa aumentar o número de dias tomando café da manhã para 7 por semana" } // Portuguese
                ]
            case QuestionnaireType.EDUCATION:
                return [
                    { "locale": "en", "text": "Consume 3 or more different fruits this week to create a color explosion in your meals!" }, // English
                    { "locale": "el", "text": "Καταναλώστε 3 ή περισσότερα διαφορετικά φρούτα αυτή την εβδομάδα για να δημιουργήσετε μια χρωματική έκρηξη στα γεύματά σας!" }, // Greek
                    { "locale": "es", "text": "¡Consume 3 o más frutas diferentes esta semana para crear una explosión de color en tus comidas!" }, // Spanish
                    { "locale": "pt", "text": "Consuma 3 ou mais frutas diferentes esta semana para criar uma explosão de cores em suas refeições!" } // Portuguese
                ]
            case QuestionnaireType.PHYSICAL_ACTIVITY:
                return [
                    { "locale": "en", "text": "You have to reduce screen time at Tv or mobile to maximum 2 hours a day" }, // English
                    { "locale": "el", "text": "Πρέπει να μειώσετε την ώρα της οθόνης σε τηλεόραση ή κινητό σε 2 ώρες το λιγότερο" }, // Greek
                    { "locale": "es", "text": "Debe reducir el tiempo de pantalla en la televisión o en el móvil a un máximo de 2 horas al día" }, // Spanish
                    { "locale": "pt", "text": "Você precisa reduzir o tempo na tela da TV ou no celular para no máximo 2 horas por dia" } // Portuguese
                ]
            default:
                return [
                    { "locale": "en", "text": "You have to increase the number of days having breakfast to 7 a week" }, // English
                    { "locale": "el", "text": "Πρέπει να αυξήσετε τον αριθμό των ημερών που έχουν πρωινό έως 7 την εβδομάδα" }, // Greek
                    { "locale": "es", "text": "Debe aumentar la cantidad de días que desayuna a 7 por semana." }, // Spanish
                    { "locale": "pt", "text": "Você precisa aumentar o número de dias tomando café da manhã para 7 por semana" } // Portuguese
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
                    { "locale": "en", "text": "Decrease number of hours in sedentary behaviors." }, // English
                    { "locale": "el", "text": "Μειώστε τον αριθμό των ωρών στις καθιστικές συμπεριφορές." }, // Greek
                    { "locale": "es", "text": "Disminuir el número de horas en comportamientos sedentarios." }, // Spanish
                    { "locale": "pt", "text": "Diminuir o número de horas em comportamentos sedentários." } // Portuguese
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