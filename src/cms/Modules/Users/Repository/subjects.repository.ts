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

    async getAll() {
        return this.subjectModel.find()
    }

    async deleteByName(name: string) {
        return this.subjectModel.findOneAndDelete({
            name,
        })
    }

    async create(name: string) {
        return this.subjectModel.create({
            name,
        })
    }
}
