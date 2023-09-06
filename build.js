import StyleDictionary from "style-dictionary-utils";
import { w3cTokenJsonParser } from "style-dictionary-utils/dist/parser/w3c-token-json-parser.js";
import { isDimension } from "style-dictionary-utils/dist/filter/isDimension.js";

const { fileHeader } = StyleDictionary.formatHelpers;

StyleDictionary.registerParser(w3cTokenJsonParser);

StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "dimension/swift/pixelUnitless",
  matcher: (token) => isDimension(token),
  transformer: (token) => parseInt(token.value),
});

StyleDictionary.registerTransform({
  type: "value",
  transitive: true,
  name: "dimension/compose/pixelToDp",
  matcher: (token) => isDimension(token),
  transformer: (token) => `${parseFloat(token.value)}.dp`,
});

StyleDictionary.registerFormat({
  name: "compose/customObject",
  formatter: ({ dictionary, file }) => {
    const output = [];

    output.push(fileHeader({ file }));

    const category = dictionary.allTokens[0]?.attributes?.category;
    output.push(`package com.example.${category}`);
    output.push("");

    output.push(
      category === "color"
        ? "import androidx.compose.ui.graphics.Color"
        : "import androidx.compose.ui.unit.dp"
    );
    output.push("");

    output.push(`internal object ${file.className} {`);

    output.push(
      ...dictionary.allTokens.map((token) => {
        return `    val ${token.name} = ${token.value}`;
      })
    );

    output.push("}");

    return output.join("\n") + "\n";
  },
});

const myStyleDictionary = StyleDictionary.extend({
  source: ["tokens/**/*.json"],
  platforms: {
    scss: {
      transforms: [
        "attribute/cti",
        "name/cti/kebab",
        "time/seconds",
        "content/icon",
        "dimension/pixelToRem",
        "color/css",
      ],
      files: [
        {
          destination: "build/scss/_variables.scss",
          format: "scss/map-deep",
        },
      ],
    },
    css: {
      transforms: [
        "attribute/cti",
        "name/cti/kebab",
        "time/seconds",
        "content/icon",
        "dimension/pixelToRem",
        "color/css",
      ],
      files: [
        {
          destination: "build/css/variables.css",
          format: "css/variables",
        },
      ],
    },
    ios: {
      transforms: [
        "attribute/cti",
        "name/cti/camel",
        "color/UIColorSwift",
        "content/swift/literal",
        "asset/swift/literal",
        "dimension/swift/pixelUnitless",
        "font/swift/literal",
      ],
      buildPath: "build/ios/",
      files: [
        {
          destination: "ColorTokens.swift",
          format: "ios-swift/enum.swift",
          className: "ColorTokens",
          filter: "isColor",
        },
        {
          destination: "DimensionTokens.swift",
          format: "ios-swift/enum.swift",
          className: "DimensionTokens",
          filter: "isDimension",
        },
      ],
    },
    android: {
      transforms: [
        "attribute/cti",
        "name/cti/pascal",
        "color/composeColor",
        "dimension/compose/pixelToDp",
      ],
      buildPath: "build/android/",
      files: [
        {
          destination: "ColorTokens.kt",
          format: "compose/customObject",
          className: "ColorTokens",
          filter: "isColor",
        },
        {
          destination: "DimensionTokens.kt",
          format: "compose/customObject",
          className: "DimensionTokens",
          filter: "isDimension",
        },
      ],
    },
  },
});

myStyleDictionary.buildAllPlatforms();
