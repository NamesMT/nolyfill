import picocolors from 'picocolors';
import type { PackageNode } from './types';
import type { ProcessError } from '@jsdevtools/ez-spawn';
import { async as ezspawnAsync } from '@jsdevtools/ez-spawn';
import type { PackageManager } from './package-manager';

const isProcessError = (e: unknown): e is ProcessError => {
  if (e instanceof Error) {
    return e.name === 'ProcessError';
  }
  return false;
};

export const generateIssue = async (cwd: string, packageManager: PackageManager, packagesNodes: PackageNode[]) => {
  console.log(picocolors.green('Your project does not contain any redundant polyfills that can be optimized by nolyfill 🚀'));
  console.log(picocolors.yellow('Found potential redudant packages that are not covered by nolyfill, generating issue...'));

  const results: Array<[name: string, stdout: string | null, stderr: string | null]> = await Promise.all(
    packagesNodes.map(async node => {
      try {
        const { stdout, stderr } = await ezspawnAsync(packageManager, ['why', node.name], { cwd });
        return [node.name, stdout, stderr];
      } catch (e) {
        if (isProcessError(e)) {
          return [node.name, e.stdout, e.stderr];
        }
        return [node.name, null, null];
      }
    })
  );

  const issueTitle = '[Generated by cli] Potential redudant packages that are not covered by nolyfill';
  const issueBody = results.map(([name, stdout, stderr]) => {
    return [
      `### \`${name}\``,
      '',
      '',
      '```',
      `$ ${packageManager} why ${name}`,
      '```',
      '',
      ...(
        stdout
          ? [
            '**stdout**',
            '',
            '```',
            stdout,
            '```',
            ''
          ]
          : []
      ),
      ...(
        stderr ? [
          '**stderr**',
          '',
          '```',
          stderr,
          '```',
          ''
        ]
          : []
      )
    ].join('\n');
  }).join('\n');

  const issueUrl = new URL('https://github.com/SukkaW/nolyfill/issues/new');
  issueUrl.searchParams.set('title', issueTitle);
  issueUrl.searchParams.set('body', issueBody);

  console.log(picocolors.blue('Issue generated! To help us improve the coverage of nolyfill, please use the link below to submit the issue:'));
  console.log(`${picocolors.underline(issueUrl.href)}\n`);
};