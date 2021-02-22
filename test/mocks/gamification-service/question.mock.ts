import { Question } from '../../../src/gamification-service/model/question'

export class QuestionMock extends Question {

    constructor(){
        super()
        this.generateQuestion()
    }

    private generateQuestion(): void {
        this.question_text = 'Question description...'
        this.possible_answers = ['answer1', 'answer2', 'answer3']
        this.final_answer = 'answer1'
        this.id = this.generateObjectId()
    }
    
}