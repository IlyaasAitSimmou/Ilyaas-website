/* ==========================================================================
 * board.ts — the 3D circuit board: its spec strip and its little labels.
 *
 * TO EDIT A LABEL ON THE PCB: find it in BOARD_ANNOTATIONS below and change
 * `designator`, `label` or `detail`. To hide one, delete its block or comment
 * it out. To reorder which ones draw on top, reorder the array.
 *
 * ABOUT `anchor`: this is the 3D position the label points at. It is measured
 * from the real CAD file, normalised as (worldPosition - boardCentre) / 100mm.
 * Don't guess these by hand — the values below were extracted from the model's
 * actual component placements. If you add a new part, the reference designators
 * and their measured anchors are listed in ANCHOR_REFERENCE at the bottom.
 * ========================================================================== */

export const BOARD = {
  name: "KRAKENBANE I",
  subsystem: "DAQ V4.1 Flight Computer",
  /** Shown in the strip under the 3D view. */
  dimensions: "38 × 100 mm",
  layers: "4-layer PCB · 1.5 mm",
  revision: "4.1",
  /** The four figures under the hero text. */
  stats: [
    { label: "Board", value: "38 × 100 mm" },
    { label: "Components", value: "80+" },
    { label: "Layers", value: "4" },
    { label: "Revision", value: "V4.1" },
  ],
};

export type BoardAnnotation = {
  id: string;
  /** The part's reference designator, e.g. "U7". Shown small and blue. */
  designator: string;
  /** The bold line of the label. */
  label: string;
  /** The grey line underneath. */
  detail: string;
  /** 3D anchor point — see the note at the top of this file. */
  anchor: [number, number, number];
};

export const BOARD_ANNOTATIONS: BoardAnnotation[] = [
  {
    id: "mcu",
    designator: "U7",
    label: "Main MCU",
    detail: "STM32F407VGT6 · LQFP-100",
    anchor: [0.0143, -0.0285, -0.2026],
  },
  {
    id: "imu",
    designator: "U2",
    label: "6-axis Inertial Measurement Unit",
    detail: " LSM6DSV32 · I2C",
    anchor: [0.0156, -0.0348, -0.3755],
  },
  {
    id: "highg",
    designator: "U4",
    label: "High-G Accelerometer",
    detail: "ADXL375 · I2C",
    anchor: [0.1425, -0.0333, -0.1567],
  },
  {
    id: "baro",
    designator: "U5",
    label: "Barometric Pressure Sensor",
    detail: "MS5607-02BA03 · I2C",
    anchor: [0.0363, -0.0335, -0.0263],
  },
  {
    id: "flash",
    designator: "IC1",
    label: "Onboard SPI NOR Flash Storage",
    detail: "W25Q64JVSSIQ · SPI",
    anchor: [-0.124, -0.0219, -0.374],
  },
  {
    id: "storage",
    designator: "J4",
    label: "MicroSD Storage - Push-Pull Socket",
    detail: "DM3BT-DSF-PEJS · SPI ",
    anchor: [-0.087, -0.027, 0.2117],
  },
  {
    id: "radio",
    designator: "U9",
    label: "Buck Switching Regulator",
    detail: "AP63203WU-7",
    anchor: [0.0565, -0.0340,  0.3574],
  },
  {
    id: "power",
    designator: "J5",
    label: "Power Input",
    detail: "XT30 · regulated rails",
    anchor: [0.1318, 0.0635, 0.3633],
  },
  {
    id: "gnssconnector",
    designator: "J1",
    label: "GNSS Connector",
    detail: "JST-GH 6 pin · connects to breakout board",
    anchor: [0.1141, -0.0015, 0.0695],
  },
  {
    id: "xbeeconnector",
    designator: "J3",
    label: "XBee Connector",
    detail: "JST-GH 6 pin · connects to breakout board",
    anchor: [0.1355, -0.0015, 0.2153],
  },
];

/**
 * Measured anchor points for other parts on the board, in case you want to add
 * more labels. Copy a value into a new BOARD_ANNOTATIONS entry above.
 *
 *   J2      SWD / debug header, 2x5 1.27mm .... [ 0.1243, -0.0215, -0.3611]
 *   XTAL1   16.000 MHz crystal ................ [-0.1455, -0.0346, -0.2083]
 *   J1      JST-GH 6-pin ...................... [ 0.1141, -0.0015,  0.0695]
 *   J3      JST-GH 6-pin ...................... [ 0.1355, -0.0015,  0.2153]
 *   U9      Regulator, TSOT-23-6 .............. [ 0.0565, -0.0340,  0.3574]
 *   Q1      MOSFET, SOT-23-3 .................. [ 0.0650, -0.0310,  0.1350]
 *   D1      Status LED, 0603 .................. [ 0.0233, -0.0325,  0.0500]
 *   D3      Diode, SOD-123 .................... [ 0.0610, -0.0219,  0.1750]
 *   LED     Power-on LED, 0603 ................ [-0.0110, -0.0325,  0.4612]
 */
export const ANCHOR_REFERENCE = {
  J2: [0.1243, -0.0215, -0.3611],
  XTAL1: [-0.1455, -0.0346, -0.2083],
  J1: [0.1141, -0.0015, 0.0695],
  J3: [0.1355, -0.0015, 0.2153],
  U9: [0.0565, -0.034, 0.3574],
  Q1: [0.065, -0.031, 0.135],
  D1: [0.0233, -0.0325, 0.05],
  POWER_LED: [-0.011, -0.0325, 0.4612],
} as const;
