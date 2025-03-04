import { Expose } from 'class-transformer';

export class UserRequestDto {
  @Expose()
  id: string;

  constructor(partial: Partial<UserRequestDto>) {
    Object.assign(this, partial);
  }
}
