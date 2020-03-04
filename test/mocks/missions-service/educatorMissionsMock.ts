export class EducatorMissionsMock {

    public fromJSON(educatorMissionsMock: EducatorMissionsMock){
        const JSON = {
            creatorId: 123,
            type: 'string e.g. Diet',
            goal: [
                {
                    locale: 'string e.g. \'en\'',
                    text: 'string'
                },
                {
                    locale: 'string e.g \'el\'',
                    text: 'string'
                },
                {
                    locale: 'string e.g. \'es\'',
                    text: 'string'
                },
                {
                    locale: 'string e.g. \'pt\'',
                    text: 'string'
                }
            ],
            description: [
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                }
            ],
            durationType: 'Week',
            durationNumber: '2',
            childRecommendation: [
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                }
            ],
            parentRecommendation: [
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                },
                {
                    locale: 'string',
                    text: 'string'
                }
            ]
        }

        return JSON
    }
}