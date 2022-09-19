import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateSignatureDto {
  @IsString()
  @ApiProperty({
    required: true,
    default: 'p45bJeGsS+kPQ+avxb7iIA==',
  })
  nonce: string

  @IsString()
  @ApiProperty({
    required: true,
    default: '0xa9f7cbe7cfd0a6e2aaa11f52b56fb201fcaf853c',
  })
  address: string

  @IsString()
  @ApiProperty({
    required: true,
    default:
      '0x8894eeacad0f2035d4c4e0f74a0dfa2366fbfe118bfbe71d9d1b18e241c954aa2915777e676e59ddc473f5ecece8a2915cbb2fbaa6646b7627038683aad234a21c',
  })
  signature: string
}
