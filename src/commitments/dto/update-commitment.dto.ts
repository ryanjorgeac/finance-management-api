import { PartialType } from '@nestjs/swagger';
import { CreateCommitmentDto } from './create-commitment.dto';

export class UpdateCommitmentDto extends PartialType(CreateCommitmentDto) {}
