import * as fs from "fs";
import * as path from "path";
import { classifyTokens, extractReferences } from "../reference-extractor";
import treebank from "talisman/tokenizers/words/treebank";

const annotatedTokens = fs
  .readFileSync(
    path.join(__dirname, "__fixtures__/referenceExtractor.test.txt")
  )
  .toString()
  .split("\n");

const tokens: string[] = [];
const labels: string[] = [];

annotatedTokens.map((line) => {
  const [t, l] = line.split("\t");
  tokens.push(t);
  labels.push(l);
});

test.each([
  "les modalités fixées par les articles L. 2313‑8 et R. 2313-3 à R. 2313-6 du code du travail ainsi que le L. 1251-18",
  "L. 1251-23xx du code du travail",
  "l’allocation de remplacement pour maternité ou paternité, prévues aux articles L. 613-19 à L.613-19-2 et L. 722-8 à 25 du code de la sécurité sociale, aux articles L. 732-10 à L. 732-12-1 du code rural et à l’article 17 de la loi n° 97-1051 du 18 novembre 1997 d’orientation sur la pêche maritime et les cultures marines",
  "Article D212 du code penal et article R413",
  "Article D212",
  "Article D-212",
  "Article D.212",
  "Article D212-3",
  "Article D-212-4",
  "Article X*212-4",
  "Article D. 212-4",
  "Article D.  212-4",
  "Article D.212-5",
  "Article D.212-5-6",
  "Article D.212-5-6-7",
  "Article XD212",
])('should extract article tokens from "%s"', (input) => {
  const tokens = treebank(input);
  expect(extractReferences(tokens)).toMatchSnapshot();
});

test("should success with actual real life set", () => {
  const predictions = classifyTokens(tokens);
  // kept here to ease checking prediction errors :
  /*
  const report = tokens.map((t, i) => {
    const label = labels[i];
    const prediction = predictions[i];
    const ok = prediction == label;
    return [
      `${ok ? "\x1b[0m" : "\x1b[31m"}`,
      `${t}\t${label}\t${prediction}\n`
    ];
  });
  console.log(...report.flat());
  */
  expect(predictions).toEqual(labels);
});

test("should find with code for actual real life set", () =>
  expect(extractReferences(tokens)).toMatchSnapshot());

test.each([
  "L. 1251-21 à L. 1251-23xx du code du travail",
  "L. 1233‑34 à L. 1233-35-1 du code du travail",
  "L. 2312-72 à 2312-77 du code du travail",
  "L. 2312-72 à 2312-77 du code de l'éducation",
  "D. 5132-9 à D. 5132-10-4 du code du travail",
  "D. 5132-9 à D. 5132-10-4",
  "L. 2315-38 à 40 du code du travail",
  "L. 351-1 à L. 351-5 du code de la sécurité sociale",
])('should resolve range "%s"', (range) => {
  const tokens = treebank(range);
  const extractedRefs = extractReferences(tokens);
  expect(extractedRefs).toMatchSnapshot();
});
