import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;

  constructor(data: T, statusCode: number, message = 'Success') {
    this.success = true;
    this.statusCode = statusCode;

    // Check if the returned data object already has a message in it.
    // If so, lift the message out of the payload and assign it to the response root.
    if (data && typeof data === 'object' && 'message' in data) {
      const { message: extractedMsg, ...rest } = data as any;
      this.message = extractedMsg;
      // If there's nothing else besides the message, make data null. Otherwise return the rest.
      this.data = Object.keys(rest).length > 0 ? rest : (null as unknown as T);
    } else {
      this.message = message;
      this.data = data;
    }

    this.timestamp = new Date().toISOString();
  }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(map((data) => new ApiResponse(data, statusCode)));
  }
}
