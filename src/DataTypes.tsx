/*
        "Secondary Weapons"
        "Guns"
        "Turrets"
        "Systems"
        "Engines"
        "Hand to Hand"
        "Power"
        "Ammunition"
        "Licenses"
        "Special"
        "Unique"
        "Powers"
        "Minerals"
        "Production"
        "Hidden"
    */


export interface SecondaryWeapon {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Gun {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Turret {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface System {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Engine {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface HandToHand {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Power {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Ammunition {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface License {
    name: string;
    cost?: number;
}

export interface Special {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Unique {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Mineral {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Production {
    name: string;
    [key: string]: any; // Allow additional fields
}

export interface Hidden {
    name: string;
    [key: string]: any; // Allow additional fields
}