---
title: "How to improve Git monorepo performance"
description: "Optimize Git in monorepos with an optimized Git config. Follow clear steps to boost CPU performance and workflow efficiency"
pubDate: 2023-12-15
updatedDate: 2024-05-04
tags: []
---

[Git v2.37.0](https://github.blog/2022-06-27-highlights-from-git-2-37/) introduced new features that significantly improve performance for repositories with large numbers of files. This blog post will cover custom Git monorepo configurations to improve local performance and provide step-by-step guidance to rollback if anything goes wrong.

## Quickstart

<div class="callout warning-callout">
  <strong>Warning:</strong> Upgrade Git to 2.42.0+ and perform the steps in this tutorial on your main branch. <code>index.skipHash</code> causes errors on older Git versions.
</div>

### Create a custom Git config file at `~/.gitconfig.monorepo`

```ini
[core]
    commitgraph = true
    fsmonitor = true
    writeCommitGraph = true
[feature]
    manyFiles = true
```

### Include the custom configuration in your global or local Git config

```ini
[include]
    path = ~/.gitconfig.monorepo
[user]
    email = 123345+darth.vader@users.noreply.github.com
    name = Darth Vader
[init]
    defaultBranch = main
[core]
    editor = nvim
[color]
    ui = auto
[branch]
    autosetuprebase = always
[rebase]
    autoStash = true
[pull]
    rebase = true
[push]
    default = current
```

### Update Git index to version 4 in repo

Although `feature.manyFiles` sets the default index version, you need to manually update the [index format](https://git-scm.com/docs/index-format) on your local repository through your terminal.

```console
$ cd ~/example-monorepo
$ git update-index --index-version 4
```

### Start `fsmonitor--daemon`

```console
$ cd ~/example-monorepo
$ git fsmonitor--daemon start
```

## Results

Using the custom Git configuration and updated index format, my command execution time for `git status` was reduced from approximately 0.316 seconds to 0.118 seconds, and CPU utilization dropped from 425% to 89%. Additionally, I no longer encounter `fatal: Unable to create 'project_path/.git/index.lock': File exists.` errors while performing basic Git commands (MacOS Intel Core i9).

**Before**

```console
$ time git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
git status  0.21s user 1.14s system 425% cpu 0.316 total
```

**After**

```console
$ time git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
git status  0.08s user 0.02s system 89% cpu 0.118 total
```

## Explanation of configurations

**`feature.manyFiles`**

Optimizes repositories with large numbers of files and commit histories. Enabling this configuration option enables the following by default:

* `index.skipHash=true`
* `index.version=4`
* `core.untrackedCache=true`

Git writes an entirely new index in `index.lock` and then replaces `.git/index` when you use basic commands. In a monorepo with many files, this index can be large and take several seconds to write every time you perform a command. Upgrading from version 2 to version 4 reduces index size by 30% to 50% by compressing pathnames, resulting in faster load times. Caching untracked files adds more memory load but again reduces the load time.

**`core.commitgraph`**

Git will use a commit history cache to significantly speed up history operations, such as `git log --graph`.

**`fetch.writeCommitGraph`**

Improves performance of commands like `git push -f` and `git log --graph` by writing a commit-graph on every `git fetch`.

## How to revert changes

1. Open your global or local Git config file and remove or comment out the include path for the custom configuration.
2. Revert index version: `git update-index --index-version 2`
3. Stop fsmonitor daemon: `git fsmonitor--daemon stop`
4. Run `git status` to verify Git is working properly.

## References

* [How to Improve Performance in Git: The Complete Guide](https://www.git-tower.com/blog/git-performance/)
* [Improve Git monorepo performance with a file system monitor](https://github.blog/2022-06-29-improve-git-monorepo-performance-with-a-file-system-monitor/)
* [git error `invalid data in index` with index.skipHash config](https://github.com/rust-lang/cargo/issues/11857)
* [git 2.40.0 index.skipHash incompatible with libgit2](https://github.com/libgit2/libgit2/issues/6531)
