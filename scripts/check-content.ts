// `npm run check`: checks the content files and explains any mistakes. Runs before every build.
import { checkContent, formatProblems } from './content-rules.ts';

const result = checkContent(process.cwd());
console.log(formatProblems(result));
process.exit(result.errors.length ? 1 : 0);
