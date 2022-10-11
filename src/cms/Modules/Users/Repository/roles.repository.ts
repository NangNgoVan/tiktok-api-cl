import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role, RoleDocument } from '../../../../shared/Schemas/role.schema'
import { CreateOrUpdateRoleRequestDto } from '../RequestDTO/create-or-update-role-request.dto'

@Injectable()
export class RolesRepository {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    ) {}

    async getAllRoles() {
        return this.roleModel.find()
    }

    async deleteByName(name: string) {
        await this.roleModel.findOneAndDelete({
            name,
        })
    }

    async createOrUpdate(
        createOrUpdateRoleRequestDto: CreateOrUpdateRoleRequestDto,
    ) {
        return this.roleModel.findOneAndUpdate(
            {
                name: createOrUpdateRoleRequestDto.name,
            },
            {
                ...createOrUpdateRoleRequestDto,
            },
            {
                upsert: true,
            },
        )
    }
}
