import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('anything v3');

    return 'Hello World! v23';
  }
}
