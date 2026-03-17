import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MailType } from 'src/schemas/mail.schema';

export class SendEmailDto {
  @IsEmail()
  receiver: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MailType)
  type: MailType;
}
