import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role, RoleDocument } from '../../../../shared/Schemas/role.schema'

@Injectable()
export class RolesRepository {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    ) {}

    async getAllRoles() {
        return this.roleModel.find()
    }
}
