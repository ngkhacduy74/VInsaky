import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthAbstract } from 'src/abstracts/auth.abstract';

@Controller()
export class OtpController {
  constructor(private readonly authService: AuthAbstract) {}


}
