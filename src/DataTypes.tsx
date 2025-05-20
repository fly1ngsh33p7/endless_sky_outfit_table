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


export interface License {
	name: string;
	cost?: number;
}

export interface Engine {
	name: string;
	licenses: License[];
	cost?: number;
	mass?: number;
	'outfit space'?: number;
	'engine capacity'?: number;
	thrust?: number;
	turn?: number;
	'reverse thrust'?: number;
	'turning energy'?: number;
	'turning heat'?: number;
	'thrust+turn per capacity'?: number;
	'energy per combined thrust'?: number;
	'thrust per capacity'?: number;
	'thrusting energy'?: number,
	'turn per capacity'?: number;
	'reverse thrust per capacity'?: number;
}

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
    [key: string]: any; // Allow additional fields
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