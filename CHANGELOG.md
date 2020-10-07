# 2.0.1
* Bug fix. When proof is such that the header merkle path is of size zero we need to be checking whether the header hash matches instead.

# 2.0.0
* Token locker that was used for ERC20 was removed. It now uses rainbow-token-connector.
* NearOnEthClient was rewritten to fix some critical issues. The following public methods were removed: `head`, `backupHead`, `backupCurrentBlockProducers`;
`replaceDuration` public method was added. The constructor now accepts additional argument `replaceDuration_` that allows resubmitting headers on the top of the headers that did not pass challenge period yet.
