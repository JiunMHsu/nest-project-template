export enum Direction {
    ASC = 'asc',
    DESC = 'desc',
}

/**
 * A single sort instruction: a property and the direction to sort it by.
 */
export class Order {
    private constructor(
        public readonly property: string,
        public readonly direction: Direction,
    ) {}

    public static asc(property: string): Order {
        return new Order(property, Direction.ASC);
    }

    public static desc(property: string): Order {
        return new Order(property, Direction.DESC);
    }

    /** Builds an order in the given direction, defaulting to ascending. */
    public static of(property: string, direction?: Direction): Order {
        return new Order(property, direction ?? Direction.ASC);
    }
}

/**
 * An immutable, ordered set of sort instructions.
 *
 * @example
 * Sort.by('lastName').and(Sort.of(Order.desc('createdAt')))
 * // sorts by lastName ASC, then createdAt DESC
 */
export class Sort implements Iterable<Order> {
    private constructor(private readonly orders: readonly Order[]) {}

    /** Sorts by the given properties, all ascending. Use `Sort.of()` for mixed directions. */
    public static by(...properties: string[]): Sort {
        return new Sort(properties.map(property => Order.asc(property)));
    }

    public static of(...orders: Order[]): Sort {
        return new Sort(orders);
    }

    public static unsorted(): Sort {
        return new Sort([]);
    }

    /** Appends another `Sort`'s orders to this one, returning a new `Sort`. */
    public and(other: Sort): Sort {
        return new Sort([...this.orders, ...other.orders]);
    }

    public isSorted(): boolean {
        return this.orders.length > 0;
    }

    public toArray(): readonly Order[] {
        return this.orders;
    }

    public [Symbol.iterator](): Iterator<Order> {
        return this.orders[Symbol.iterator]();
    }
}
