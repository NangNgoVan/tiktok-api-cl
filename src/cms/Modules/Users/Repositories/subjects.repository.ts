import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    Subject,
    SubjectDocument,
} from '../../../../shared/Schemas/subject.schema'

@Injectable()
export class SubjectsRepository {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    ) {}

    async getAllSubjects() {
        return this.subjectModel.find()
    }
}
