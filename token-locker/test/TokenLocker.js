const { borshifyOutcomeProof } = require('rainbow-bridge-lib/rainbow/borsh');

const TokenLocker = artifacts.require('TokenLocker');
const NearProverMock = artifacts.require('NearProverMock');
const NearProverRejectMock = artifacts.require('NearProverRejectMock');
const MockERC20 = artifacts.require('MockERC20');

contract('TokenLocker', function ([_, addr1]) {
    beforeEach(async function () {
        this.token = await MockERC20.new();
        this.prover = await NearProverMock.new();
        this.locker = await TokenLocker.new(this.token.address, Buffer.from('nearfuntoken', 'utf-8'), this.prover.address);
        await this.token.mint(this.locker.address, 10000);
    });

    it('should be ok', async function () {
        const proof1 = borshifyOutcomeProof(require('./proof1.json'));
        const lockerBalance = await this.token.balanceOf(this.locker.address);
        console.log(`LOCKER BALANCE ${lockerBalance}`);
        const receiverBalance = await this.token.balanceOf('0xEC8bE1A5630364292E56D01129E8ee8A9578d7D8');
        console.log(`RECEIVER BALANCE ${receiverBalance}`);
        expect(receiverBalance.toString()).to.equal('0');
        await this.locker.unlockToken(proof1, 1099);
        const balance = await this.token.balanceOf('0xEC8bE1A5630364292E56D01129E8ee8A9578d7D8');
        console.log(`RECEIVER BALANCE ${balance}`);
        expect(balance.toString()).to.equal('1');
    });
});

contract('TokenLocker 2', function ([_, addr1]) {
    beforeEach(async function () {
        this.token = await MockERC20.new();
        this.prover = await NearProverRejectMock.new();
        this.locker = await TokenLocker.new(this.token.address, Buffer.from('nearfuntoken', 'utf-8'), this.prover.address);
        await this.token.mint(this.locker.address, 10000);
    });

    it('should be ok', async function () {
        const proof1 = borshifyOutcomeProof(require('./proof1.json'));
        const lockerBalance = await this.token.balanceOf(this.locker.address);
        console.log(`LOCKER BALANCE ${lockerBalance}`);
        const receiverBalance = await this.token.balanceOf('0xEC8bE1A5630364292E56D01129E8ee8A9578d7D8');
        console.log(`RECEIVER BALANCE ${receiverBalance}`);
        let revert = false;
        try {
            await this.locker.unlockToken(proof1, 1099);
        } catch (e) {
            revert = true;
            expect(e.reason).to.equal('Proof should be valid');
        }
        expect(revert).to.be.true;
        const balance = await this.token.balanceOf('0xEC8bE1A5630364292E56D01129E8ee8A9578d7D8');
        expect(balance.toString()).to.equal(receiverBalance.toString());
        console.log(`RECEIVER BALANCE ${balance}`);
    });
})
