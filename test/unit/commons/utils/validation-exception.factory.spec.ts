import { describe, expect, it } from 'vitest';

import { BadRequestException, HttpStatus, ValidationError } from '@nestjs/common';

import { validationExceptionFactory } from '@commons/utils/validation-exception.factory';

function error(property: string, constraints?: Record<string, string>, children: ValidationError[] = []) {
    return { property, constraints, children } as ValidationError;
}

function messagesOf(errors: ValidationError[]): string[] {
    return (validationExceptionFactory(errors).getResponse() as { message: string[] }).message;
}

describe('validationExceptionFactory', () => {
    it('should return a BadRequestException', () => {
        expect(validationExceptionFactory([])).toBeInstanceOf(BadRequestException);
    });

    it('should use a 400 status', () => {
        expect(validationExceptionFactory([]).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should collect the constraint message of a single error', () => {
        const errors = [error('email', { isEmail: 'email must be an email' })];

        expect(messagesOf(errors)).toEqual(['email must be an email']);
    });

    it('should collect every constraint on one property', () => {
        const errors = [error('name', { isString: 'name must be a string', minLength: 'name is too short' })];

        expect(messagesOf(errors)).toEqual(['name must be a string', 'name is too short']);
    });

    it('should collect across sibling errors', () => {
        const errors = [error('email', { isEmail: 'bad email' }), error('age', { isInt: 'bad age' })];

        expect(messagesOf(errors)).toEqual(['bad email', 'bad age']);
    });

    it('should collect from nested children', () => {
        const errors = [error('address', undefined, [error('city', { isString: 'city must be a string' })])];

        expect(messagesOf(errors)).toEqual(['city must be a string']);
    });

    it('should collect from deeply nested children', () => {
        const errors = [
            error('order', undefined, [error('items', undefined, [error('sku', { isString: 'sku must be a string' })])]),
        ];

        expect(messagesOf(errors)).toEqual(['sku must be a string']);
    });

    it('should keep a parent constraint alongside its children', () => {
        const errors = [
            error('address', { isObject: 'address must be an object' }, [error('city', { isString: 'bad city' })]),
        ];

        expect(messagesOf(errors)).toEqual(['address must be an object', 'bad city']);
    });

    it('should produce no messages for an error with neither constraints nor children', () => {
        expect(messagesOf([error('mystery')])).toEqual([]);
    });

    it('should produce no messages for no errors', () => {
        expect(messagesOf([])).toEqual([]);
    });
});
