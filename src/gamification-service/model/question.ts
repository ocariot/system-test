import { Entity } from './entity'

export class Question extends Entity {
    public question_text?: string
    public possible_answers?: Array<string>
    public final_answer?: string

    public asJSONResponse(): any {
        return {
            id: this.id,
            question_text: this.question_text,
            possible_answers: this.possible_answers,
            final_answer: this.final_answer
        }
    }
    
    public asJSONRequest(): any {
        return {
            id: this.id,
            question_text: this.question_text,
            possible_answers: this.possible_answers,
            final_answer: this.final_answer
        }
    }

}