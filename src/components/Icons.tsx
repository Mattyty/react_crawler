import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

// Beer icon
export function IconBeer({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="beer" size={size} color={color} />;
}

// Map icon
export function IconMap({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="map" size={size} color={color} />;
}

// Back arrow
export function IconBack({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="arrow-back" size={size} color={color} />;
}

// Graduation cap (student)
export function IconGraduation({ size = 20, color = '#000' }: IconProps) {
  return <FontAwesome5 name="graduation-cap" size={size} color={color} />;
}

// Briefcase (work)
export function IconBriefcase({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="briefcase" size={size} color={color} />;
}

// Camera (visitor)
export function IconCamera({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="camera" size={size} color={color} />;
}

// Home (local)
export function IconHome({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="home" size={size} color={color} />;
}

// Drink/cocktail
export function IconDrink({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="glass-cocktail" size={size} color={color} />;
}

// City/buildings
export function IconCity({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="city" size={size} color={color} />;
}

// User circle (profile)
export function IconUserCircle({ size = 20, color = '#000' }: IconProps) {
  return <FontAwesome name="user-circle" size={size} color={color} />;
}

// Invader/space invader (about us)
export function IconInvader({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="space-invaders" size={size} color={color} />;
}

// Ship (Liverpool)
export function IconShip({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="ferry" size={size} color={color} />;
}

// Station/broadcasting (live indicator)
export function IconStation({ size = 20, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name="broadcast" size={size} color={color} />;
}

// Clock (time/upcoming indicator)
export function IconTime({ size = 20, color = '#000' }: IconProps) {
  return <Ionicons name="time" size={size} color={color} />;
}
