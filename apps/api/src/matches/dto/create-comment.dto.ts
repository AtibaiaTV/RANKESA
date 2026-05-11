import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  content: string
}
