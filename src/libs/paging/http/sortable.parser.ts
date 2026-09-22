import { Direction, Order, Sort } from '@libs/paging/core';
import { BadRequestException } from '@nestjs/common';

export abstract class SortParser {
    public abstract parse(raw: unknown): Sort;

    public abstract isEmpty(): boolean;

    public abstract allowedFields(): string[];

    protected _parse(raw: unknown, fields: { [key: string]: string }): Sort {
        if (!raw) return Sort.unsorted();

        const values = (Array.isArray(raw) ? raw : [raw]).filter((value): value is string => typeof value === 'string');

        const orders = values.map(value => {
            const [property, rawDirection] = value.split(',').map(part => part.trim());
            // Own properties only: inherited keys such as 'constructor' are truthy on a plain object.
            const column = Object.prototype.hasOwnProperty.call(fields, property) ? fields[property] : undefined;
            if (!column) throw this.buildError(property, Object.keys(fields));
            return rawDirection?.toUpperCase() === (Direction.DESC as string) ? Order.desc(column) : Order.asc(column);
        });

        return Sort.of(...orders);
    }

    private buildError(invalidField: string, allowedFields: string[]): BadRequestException {
        const description =
            allowedFields.length === 0 ? `No fields are sortable.` : `Allowed fields: ${allowedFields.join(', ')}`;

        return new BadRequestException(`Cannot sort by '${invalidField}'. ${description}`);
    }
}

export class SortParserFactory {
    public static create(sortableFields: string[] | { [key: string]: string }): SortParser {
        if (Array.isArray(sortableFields)) {
            return new SimpleFieldsParser(sortableFields);
        } else {
            return new NamedFieldsParser(sortableFields);
        }
    }
}

export class SimpleFieldsParser extends SortParser {
    public readonly fields: string[];

    public constructor(fields: string[]) {
        super();
        this.fields = fields;
    }

    public override parse(raw: unknown): Sort {
        const fieldMap = {};
        this.fields.forEach(field => {
            fieldMap[field] = field;
        });
        return this._parse(raw, fieldMap);
    }

    public override isEmpty(): boolean {
        return this.fields.length === 0;
    }

    public override allowedFields(): string[] {
        return this.fields;
    }
}

export class NamedFieldsParser extends SortParser {
    public readonly fields: { [key: string]: string };

    public constructor(fields: { [key: string]: string }) {
        super();
        this.fields = fields;
    }

    public override parse(raw: unknown): Sort {
        return this._parse(raw, this.fields);
    }

    public override isEmpty(): boolean {
        return Object.keys(this.fields).length === 0;
    }

    public override allowedFields(): string[] {
        return Object.keys(this.fields);
    }
}
