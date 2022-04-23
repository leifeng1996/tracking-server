import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TableUserDocument } from '../../schemas/table_user.schema';

@Injectable()
export class AuthService {
  constructor() { }
}
