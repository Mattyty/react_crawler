import React from 'react';
import { Platform, Text } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

function SvgIcon({ size = 20, color = '#000', path }: IconProps & { path: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('div', {
      style: { width: size, height: size, display: 'inline-flex' },
      dangerouslySetInnerHTML: {
        __html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">${path}</svg>`,
      },
    });
  }
  // Fallback for native - simple dot placeholder
  return React.createElement(Text, { style: { fontSize: size, color } }, '●');
}

// BiSolidBeer
export function IconBeer(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M19 9h-1V4H8.16c-.19-.58-.47-1.12-.83-1.59l-.22-.28-.22.28C6.19 3.22 5.1 4 4 4v2c.85 0 1.63-.37 2.16-1H16v4H6c-1.1 0-2 .9-2 2v5c0 1.65 1.35 3 3 3h6c1.65 0 3-1.35 3-3v-1h2c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2zm-5 7c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-5h8v5zm5-3h-2v-2h2v2z"/>',
  });
}

// BiSolidMap
export function IconMap(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="m9 6.882-7-3.5v13.236l7 3.5 6-3 7 3.5V7.382l-7-3.5-6 3zM15 15l-6 3V9l6-3v9z"/>',
  });
}

// BiSolidLeftArrowSquare (back button)
export function IconBack(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2zm-7-4 1.41-1.41L10.83 13H16v-2h-5.17l2.58-2.59L12 7l-5 5 5 5z"/>',
  });
}

// BiSolidGraduation (student)
export function IconGraduation(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="m12 3-10 4 10 4 8.33-3.33V15h1.67V7L12 3zm-4.08 8.49L4 13.13V16.5c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-3.37l-3.92-1.64L12 13.48l-4.08-1.99z"/>',
  });
}

// BiSolidBriefcase (work)
export function IconBriefcase(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/>',
  });
}

// BiSolidCamera (visitor)
export function IconCamera(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M12 9c-1.626 0-3 1.374-3 3s1.374 3 3 3 3-1.374 3-3-1.374-3-3-3z"/><path d="M20 5h-2.586l-2.707-2.707A.996.996 0 0 0 14 2h-4a.996.996 0 0 0-.707.293L6.586 5H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zm-8 12c-2.71 0-5-2.29-5-5s2.29-5 5-5 5 2.29 5 5-2.29 5-5 5z"/>',
  });
}

// BiSolidHome (resident/local)
export function IconHome(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="m21.743 12.331-9-10c-.379-.422-1.107-.422-1.486 0l-9 10a.998.998 0 0 0-.17 1.076c.16.361.518.593.913.593h2v7c0 .552.448 1 1 1h3c.552 0 1-.448 1-1v-4h4v4c0 .552.448 1 1 1h3c.552 0 1-.448 1-1v-7h2a.998.998 0 0 0 .743-1.669z"/>',
  });
}

// BiSolidDrink
export function IconDrink(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M20.832 4.555A1 1 0 0 0 20 3H4a1 1 0 0 0-.832 1.555L11 16.303V20H8v2h8v-2h-3v-3.697l7.832-11.748zM12 14.197 8.535 9h6.93L12 14.197z"/>',
  });
}

// BiSolidCity
export function IconCity(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M21 6h-4V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v5H3a1 1 0 0 0-1 1v12h9v-4h2v4h9V7a1 1 0 0 0-1-1zM7 18H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V8h2v2zm0-4H9V4h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z"/>',
  });
}

// BiSolidUserCircle
export function IconUserCircle(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm0 5c1.727 0 3 1.272 3 3s-1.273 3-3 3c-1.726 0-3-1.272-3-3s1.274-3 3-3zm-5.106 9.772c.897-1.32 2.393-2.2 4.106-2.2h2c1.714 0 3.209.88 4.106 2.2C15.828 18.14 14.015 19 12 19s-3.828-.86-5.106-2.228z"/>',
  });
}

// BiSolidInvader
export function IconInvader(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M6 3h2v2H6zm2 2h2v2H8zm2 0h4V3h-4zm4 0h2V3h-2zm0 0v2h2V5zm-8 4H4v2h2V7H6zm12 0h-2v2h2v2h2V9h-2zM6 11H4v2h2zm0 0h2v-2H6zm2 2v2H6v2h2v-2h2v-2zm8 0v2h2v2h-2v2h2v-2h2v-2h-2v-2zm0 0h-2v-2h2zm-4-2h2V9h-2V7h-2v2h-2v2h2v2h2z"/>',
  });
}

// BiSolidShip
export function IconShip(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M16 2h-4v4H4v14h2.29l.14.22.22.15A5.93 5.93 0 0 0 10 21.5c1.46 0 2.85-.53 3.93-1.5A5.95 5.95 0 0 0 18 21.5c1.3 0 2.52-.42 3.51-1.15l.26-.18.08-.22V14h-6V6h.28L16 2zm-4 6v6H6V8h6zm6.91 10.36a3.94 3.94 0 0 1-2.84 1.14 3.93 3.93 0 0 1-2.85-1.14l-1.14-1.08-1.15 1.08a3.93 3.93 0 0 1-2.86 1.14 3.93 3.93 0 0 1-2.85-1.14l-.28-.26H20v.01l-.09.07-.28.18z"/>',
  });
}

// BiStation (live/broadcasting indicator)
export function IconStation(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M7.05 7.05a7 7 0 0 0 0 9.9l1.414-1.414a5 5 0 0 1 0-7.072L7.05 7.05zm8.486-1.414 1.414 1.414a5 5 0 0 1 0 7.072l1.414 1.414a7 7 0 0 0 0-9.9zM4.222 4.222a11 11 0 0 0 0 15.556l1.414-1.414a9 9 0 0 1 0-12.728L4.222 4.222zm14.142-1.414 1.414 1.414a9 9 0 0 1 0 12.728l1.414 1.414a11 11 0 0 0 0-15.556z"/>',
  });
}

// BiTime (clock indicator)
export function IconTime(props: IconProps) {
  return SvgIcon({
    ...props,
    path: '<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>',
  });
}
