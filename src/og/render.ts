/// <reference types="node" />
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import satori from 'satori';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../consts';

const FONT_NAME = 'Shippori Mincho';
const FONT_WEIGHT = 500;
const COLOR_BACKGROUND = '#FAF7F2';
const COLOR_TEXT = '#2A2420';
const COLOR_SUB = '#96580A';
const COLOR_BRAND = '#E7A03C';
const COLOR_FRAME = '#E6DCCD';
const COLOR_FRAME_INNER = '#EFE6D8';
const FRAME_INSET = 11;
const HEADING_FONT_SIZE = 54;
const HEADING_LINE_HEIGHT = 1.6;
const HEADING_LETTER_SPACING = '0.05em';
const LABEL = 'envas ヘルプ';
const LABEL_FONT_SIZE = 28;
const LABEL_LETTER_SPACING = '0.3em';
const ORNAMENT_LINE_WIDTH = 96;
const ORNAMENT_DIAMOND_SIZE = 12;
const ORNAMENT_GAP = 20;
const CONTENT_PADDING_X = 120;

// モジュール内で 1 回だけ読む。カレントディレクトリ基準にするのは、ビルド後の import.meta.url が位置を保たないため
let fontData: Promise<Buffer> | undefined;
function loadFont() {
  fontData ??= readFile(resolve('src/assets/fonts/ShipporiMincho-Medium.ttf'));
  return fontData;
}

function box(style: Record<string, unknown>, children?: unknown) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function layout(heading: string) {
  const ornament = box({ alignItems: 'center', gap: ORNAMENT_GAP }, [
    box({ width: ORNAMENT_LINE_WIDTH, height: 2, background: COLOR_BRAND }),
    box({
      width: ORNAMENT_DIAMOND_SIZE,
      height: ORNAMENT_DIAMOND_SIZE,
      background: COLOR_BRAND,
      transform: 'rotate(45deg)',
    }),
    box({ width: ORNAMENT_LINE_WIDTH, height: 2, background: COLOR_BRAND }),
  ]);

  return box(
    {
      width: '100%',
      height: '100%',
      background: COLOR_BACKGROUND,
      fontFamily: FONT_NAME,
      color: COLOR_TEXT,
      position: 'relative',
    },
    [
      box({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: `1px solid ${COLOR_FRAME}`,
      }),
      box({
        position: 'absolute',
        top: FRAME_INSET,
        left: FRAME_INSET,
        right: FRAME_INSET,
        bottom: FRAME_INSET,
        border: `1px solid ${COLOR_FRAME_INNER}`,
      }),
      box(
        {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          width: '100%',
          height: '100%',
          padding: `0 ${CONTENT_PADDING_X}px`,
        },
        [
          box(
            { fontSize: LABEL_FONT_SIZE, letterSpacing: LABEL_LETTER_SPACING, color: COLOR_SUB },
            LABEL,
          ),
          ornament,
          box(
            {
              justifyContent: 'center',
              textAlign: 'center',
              textWrap: 'balance',
              fontSize: HEADING_FONT_SIZE,
              lineHeight: HEADING_LINE_HEIGHT,
              letterSpacing: HEADING_LETTER_SPACING,
            },
            heading,
          ),
        ],
      ),
    ],
  );
}

export async function renderOgImage(heading: string): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(layout(heading) as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: [{ name: FONT_NAME, data: await loadFont(), weight: FONT_WEIGHT, style: 'normal' }],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
