import { Injectable } from '@nestjs/common'
import { GetActionResponseDto } from '../ResponseDTO/get-action-response.dto'
import { SubjectsRepository } from '../Repository/subjects.repository'
import { GetSubjectResponseDto } from '../ResponseDTO/get-subject-response.dto'
import { CreateSubjectRequestDto } from '../RequestDTO/create-subject-request.dto'

@Injectable()
export class SubjectsService {
    constructor(private readonly subjectRepository: SubjectsRepository) {}

    async getAll(): Promise<GetSubjectResponseDto[]> {
        return this.subjectRepository.getAll()
    }

    async create(
        createSubjectRequestDto: CreateSubjectRequestDto,
    ): Promise<GetActionResponseDto> {
        return this.subjectRepository.create(createSubjectRequestDto.name)
    }

    async deleteByName(name: string) {
        await this.subjectRepository.deleteByName(name)
    }
}
