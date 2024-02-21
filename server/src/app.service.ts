import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('anything v1');

    return 'Hello World! v6';
  }
}
