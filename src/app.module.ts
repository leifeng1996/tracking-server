import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './routers/auth/auth.module';
import { UserModule } from './routers/user/user.module';
import { TableModule } from './routers/table/table.module';
import { AdminModule } from './routers/admin/admin.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost:37017/tracking'),
    MongooseModule.forRoot('mongodb://192.168.13.25:21001/tracking'),
    AuthModule,
    UserModule,

    TableModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
