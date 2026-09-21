import { BadRequestException, ValidationError } from '@nestjs/common';

function collectMessages(errors: ValidationError[]): string[] {
    return errors.flatMap(error => [
        ...(error.constraints ? Object.values(error.constraints) : []),
        ...(error.children?.length ? collectMessages(error.children) : []),
    ]);
}

export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
    return new BadRequestException(collectMessages(errors));
}
