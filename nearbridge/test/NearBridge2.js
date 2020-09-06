
const { time } = require('@openzeppelin/test-helpers');
const { borshify, borshifyInitialValidators } = require('rainbow-bridge-lib/rainbow/borsh');
const { expect, assert } = require('chai');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const Ed25519 = artifacts.require('Ed25519');
const NearBridge = artifacts.require('NearBridge');
const NearDecoder = artifacts.require('NearDecoder');

async function timeIncreaseTo(seconds) {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

contract('NearBridge2', function ([_, addr1]) {
    beforeEach(async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(10));
        await this.bridge.deposit({ value: web3.utils.toWei('1') });
    });

    it('should be ok', async function () {
        const block9605 = borshify(require('./block_9605.json'));
        const block9610 = borshify(require('./block_9610.json'));

        // We don't know block producers that produce block_9605, assume it's same as block_9605.next_bps
        await this.bridge.initWithValidators(borshifyInitialValidators(require('./block_9605.json').next_bps));
        await this.bridge.initWithBlock(block9605);
        await this.bridge.blockHashes(9605);
        expect(await this.bridge.blockHashes(9605)).to.be.equal(
            '0xc4770276d5e782d847ea3ce0674894a572df3ea75b960ff57d66395df0eb2a34',
        );

        await this.bridge.addLightClientBlock(block9610);
        expect(await this.bridge.blockHashes(9610)).to.be.equal(
            '0xf28629da269e59f2494c6bf283e9e67dadaa1c1f753607650d21e5e5b916a0dc',
        );
    });
});

// contract('2020-08-18 Example', function ([_, addr1]) {
//     beforeEach(async function () {
//         this.decoder = await NearDecoder.new();
//         this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(10));
//         await this.bridge.deposit({ value: web3.utils.toWei('1') });
//     });

//     it('should be ok', async function () {
//         const block_12640118 = borshify(require('./block_12640118.json'));
//         const block_12640218 = borshify(require('./block_12640218.json'));

//         await this.bridge.initWithValidators(borshifyInitialValidators(require('./init_validators_12640118.json').next_bps));
//         await this.bridge.initWithBlock(block_12640118);
//         await this.bridge.blockHashes(12640118);
//         await this.bridge.addLightClientBlock(block_12640218);
//     });
// });

contract('Add second block in first epoch should be verifiable', function ([_, addr1]) {
    beforeEach(async function () {

    });

    it('should be ok', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));
        await this.bridge.deposit({ value: web3.utils.toWei('1') });

        // Get "initial validators" that will produce block 304
        const block244 = require('./244.json');
        const initialValidators = block244.next_bps;

        const block304 = require('./304.json');
        const block308 = require('./308.json');

        await this.bridge.initWithValidators(borshifyInitialValidators(initialValidators));
        await this.bridge.initWithBlock(borshify(block304));
        await this.bridge.blockHashes(304);

        let now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block308));
        await this.bridge.blockHashes(308);

        for (let i = 0; i < block308.approvals_after_next.length; i++) {
            if (block308.approvals_after_next[i]) {
                assert(this.bridge.checkBlockProducerSignatureInHead(i));
            }
        }
    });
});

contract('Test adding blocks in new epoch when bps change', function ([_, addr1]) {
    beforeEach(async function () {

    });

    it('should be ok', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));
        await this.bridge.deposit({ value: web3.utils.toWei('1') });

        const block181 = require('./181.json');
        const block244 = require('./244.json');
        const block304 = require('./304.json');
        const block308 = require('./308.json');
        const block368 = require('./368.json');
        const block369 = require('./369.json');

        await this.bridge.initWithValidators(borshifyInitialValidators(block181.next_bps));
        await this.bridge.initWithBlock(borshify(block244));
        await this.bridge.blockHashes(244);

        let now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block304));
        await this.bridge.blockHashes(304);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block308));
        await this.bridge.blockHashes(308);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block368));
        await this.bridge.blockHashes(368);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block369));
        await this.bridge.blockHashes(369);
    });
});

contract('After challenge prev should be revert to prev epoch of latest valid block', function ([_, addr1]) {
    beforeEach(async function () {

    });

    it('should be ok', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));
        await this.bridge.deposit({ value: web3.utils.toWei('1') });

        const block181 = require('./181.json');
        const block244 = require('./244.json');
        const block304 = require('./304.json');
        const block308 = require('./308.json');
        const block368 = require('./368.json');
        const block369 = require('./369.json');

        await this.bridge.initWithValidators(borshifyInitialValidators(block181.next_bps));
        await this.bridge.initWithBlock(borshify(block244));
        await this.bridge.blockHashes(244);

        let now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block304));
        await this.bridge.blockHashes(304);

        let oldEpochId = (await this.bridge.head()).epochId;

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block308));
        await this.bridge.blockHashes(308);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        block368.approvals_after_next[0] = block368.approvals_after_next[1];
        await this.bridge.addLightClientBlock(borshify(block368));
        await this.bridge.blockHashes(368);
        assert((await this.bridge.head()).epochId != oldEpochId)
        await this.bridge.challenge(addr1, 0);
        assert((await this.bridge.head()).epochId == oldEpochId)
    });
});

contract('Multiple deposit and withdraw test', function ([owner, account1, account2, account3]) {
    beforeEach(async function () {

    });

    it('multiple deposit is rejected', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));
        await this.bridge.deposit({ value: web3.utils.toWei('1') });
        let revert = false;
        try {
            await this.bridge.deposit({ value: web3.utils.toWei('1') });
        } catch (e) {
            revert = true;
            expect(e.toString()).to.have.string('revert');
        }
        expect(revert).to.be.true;

        revert = false;
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });
        try {
            await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });
        } catch (e) {
            revert = true;
            expect(e.toString()).to.have.string('revert');
        }
        expect(revert).to.be.true;
    });

    it('deposit from multiple account', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));

        expect((await this.bridge.balanceOf(owner)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1') });
        expect((await this.bridge.balanceOf(owner)).toString()).equal(web3.utils.toWei('1'))

        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('1'))

        expect((await this.bridge.balanceOf(account2)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account2 });
        expect((await this.bridge.balanceOf(account2)).toString()).equal(web3.utils.toWei('1'))
    })

    it('fail attempt to withdraw to early', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));

        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });

        // purpose of this is to update head.validateAfter so that later withdraw txn's block.timestamp <= head.validAfter
        {
            // Get "initial validators" that will produce block 304
            const block244 = require('./244.json');
            const initialValidators = block244.next_bps;

            const block304 = require('./304.json');
            block304.inner_lite.timestamp_nanosec = await time.latest()
            await this.bridge.initWithValidators(borshifyInitialValidators(initialValidators), { from: account1 });
            await this.bridge.initWithBlock(borshify(block304), { from: account1 });
            await this.bridge.blockHashes(304);

            let now = await time.latest();
            await timeIncreaseTo(now.add(time.duration.seconds(3600)));

            const block368 = require('./368.json')
            await this.bridge.addLightClientBlock(borshify(block368), { from: account1 });
            await this.bridge.blockHashes(368);
        }
        let revert = false;
        try {
            // only head.submitter is required to withdraw after lock period
            await this.bridge.withdraw({ from: account1 })
        } catch (e) {
            revert = true;
            expect(e.toString()).to.have.string('revert');
        }
        expect(revert).to.be.true;
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('1'))
    })

    it('successful attempt to withdraw', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));

        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('1'))

        // purpose of this is to update head.validateAfter so that later withdraw txn's block.timestamp <= head.validAfter
        {
            // Get "initial validators" that will produce block 304
            const block244 = require('./244.json');
            const initialValidators = block244.next_bps;

            const block304 = require('./304.json');
            block304.inner_lite.timestamp_nanosec = await time.latest()
            await this.bridge.initWithValidators(borshifyInitialValidators(initialValidators), { from: account1 });
            await this.bridge.initWithBlock(borshify(block304), { from: account1 });
            await this.bridge.blockHashes(304);

            let now = await time.latest();
            await timeIncreaseTo(now.add(time.duration.seconds(3600)));

            const block368 = require('./368.json')
            await this.bridge.addLightClientBlock(borshify(block368), { from: account1 });
            await this.bridge.blockHashes(368);

        }
        let now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));
        // only head.submitter is required to withdraw after lock period
        await this.bridge.withdraw({ from: account1 })
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
    })

    it('challenge should slash bond and pay reward', async function () {
        this.decoder = await NearDecoder.new();
        this.bridge = await NearBridge.new((await Ed25519.deployed()).address, web3.utils.toBN(1e18), web3.utils.toBN(3600));
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
        await this.bridge.deposit({ value: web3.utils.toWei('1'), from: account1 });
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('1'))

        const block181 = require('./181.json');
        const block244 = require('./244.json');
        const block304 = require('./304.json');
        const block308 = require('./308.json');
        const block368 = require('./368.json');

        await this.bridge.initWithValidators(borshifyInitialValidators(block181.next_bps));
        await this.bridge.initWithBlock(borshify(block244));
        await this.bridge.blockHashes(244, { from: account1 });

        let now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block304), { from: account1 });
        await this.bridge.blockHashes(304);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        await this.bridge.addLightClientBlock(borshify(block308), { from: account1 });
        await this.bridge.blockHashes(308);

        now = await time.latest();
        await timeIncreaseTo(now.add(time.duration.seconds(3600)));

        block368.approvals_after_next[0] = block368.approvals_after_next[1];
        await this.bridge.addLightClientBlock(borshify(block368), { from: account1 });
        await this.bridge.blockHashes(368);

        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('1'))
        let oldBalance = await web3.eth.getBalance(account2)
        // avoid gas cost from receiver
        await this.bridge.challenge(account2, 0, { from: account3 });
        expect((await this.bridge.balanceOf(account1)).toString()).equal(web3.utils.toWei('0'))
        let newBalance = await web3.eth.getBalance(account2)
        // but deposit lockAmount has additional gas refund, sometimes it is slightly more than 0.5xlockAmount
        expect(newBalance - oldBalance >= web3.utils.toWei('0.5')).to.be.true
        expect((newBalance - oldBalance - web3.utils.toWei('0.5')) / web3.utils.toWei('0.5')).lessThan(0.00001)
    });
})
