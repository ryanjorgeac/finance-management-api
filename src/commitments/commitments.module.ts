import { Module } from '@nestjs/common';
import { CommitmentsService } from './commitments.service';
import { CommitmentsController } from './commitments.controller';

@Module({
  controllers: [CommitmentsController],
  providers: [CommitmentsService],
  exports: [CommitmentsService],
})
export class CommitmentsModule {}
