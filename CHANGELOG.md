# rollup-plugin-generate-html-template

## 1.8.0

- Add `embedContent` option (#26, bengsfort/rollup-plugin-generate-html-template@, thanks @lgirma)

## 1.7.0

- Add basic css support (#23, bengsfort/rollup-plugin-generate-html-template@f06f85f, thanks @snellcode, @longrunningprocess)

## 1.2.0

- Ensure output directories exist before creating anything (fixes #5)
- Inject all entry points instead of failing, but does not embed dynamic imports (fixes #7)
- Update to Babel7
- Switch to jest tests
- Updates formatting of project to use prettier + better eslint rules
- Add code coverage checks

## 1.1.0

- Fixed issue where template creation promise would not resolve. (bengsfort/rollup-plugin-generate-html-template@b0bb659)
- Renamed `file` option to `template` . (bengsfort/rollup-plugin-generate-html-template@27a49b2)
- Added integration tests. (bengsfort/rollup-plugin-generate-html-template@bfa7b4b)
- Added option to rename destination file. (bengsfort/rollup-plugin-generate-html-template@33cb1b2)g

## 1.0.0

- Initial release.
