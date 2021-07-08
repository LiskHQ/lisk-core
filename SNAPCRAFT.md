# Snapcraft

## Building the snap

### Prerequisites

- a system with snapd and snapcraft installed
- lxd

### How to build the snap

You should be able to just run:

```
snapcraft snap --use-lxd
```

If it's your first time running `lxd` though, you'll have to run `lxd init` to set it up (follow the prompts)

If successful, you will have a newly created snap file.

## Install the snap locally

```
snap install --dangerous name_of_snap.snap
```

Note: `--dangerous` is needed here to install the local snap file. For more details see `man snap`

## Run the snap

At this point, you should be able to run `lisk-core` as if you had installed it with `npm`.
