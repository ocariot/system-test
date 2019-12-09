export class Q501PhysicalActivityForChildrenMock {
    public id?: string
    public child_id?: string
    public date?: Date
    public a?: string
    public b?: string
    public c?: string
    public d?: string
    public e?: string
    public f?: string
    public gh?: string
    public i?: string
    public k?: string
    public l?: string
    public m?: string
    public n?: string
    public o?: string
    public p?: string
    public q?: string
    public r?: string
    public s?: string
    public t?: string
    public u?: string
    public paqc_2?: string
    public paqc_3?: string
    public paqc_4?: string
    public paqc_5?: string
    public paqc_4br?: string
    public paqc_5br?: string
    public paqc_6?: string
    public paqc_6br?: string
    public paqc_7?: string
    public paqc_8?: string
    public a_7?: string
    public b_7?: string
    public c_7?: string
    public d_7?: string
    public e_7?: string
    public f_7?: string
    public g_7?: string
    public paqc_10?: string // se for 1
    public paqc_11?: string
    public percentage?: string
    public state?: string
    public scoring_PAQC?: string

    constructor() {
        this.generateQ501PhysicalActivityForChildren()
    }

    private generateQ501PhysicalActivityForChildren() {
        this.id = this.generateObjectId()
        this.child_id = this.generateObjectId()
        this.date = this.generateDate()
        this.a = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.b = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.c = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.d = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.e = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.f = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.gh = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.i = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.k = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.l = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.m = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.n = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.o = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.p = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.q = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.r = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.s = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.t = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.u = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_2 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_3 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_4 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_4br = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_5 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_5br = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_6 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_8 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.a_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.b_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.c_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.d_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.e_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.f_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.g_7 = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.paqc_10 = Math.floor((Math.random() * 2 + 1)).toString()// [1, 2]
        this.paqc_11 = this.getDisease(this.paqc_10)
        this.percentage = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.state = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]
        this.scoring_PAQC = Math.floor((Math.random() * 5 + 1)).toString()// [1, 5]

        return this
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private generateDate(): Date {
        const dateStart = new Date(2018, 4, 15)
        const dateEnd = new Date()
        const randomDateMilliseconds = dateEnd.getTime() + Math.floor(Math.random() * (dateEnd.getTime() - dateStart.getTime()))

        const date = new Date(randomDateMilliseconds)

        const month = date.getMonth() + 1
        let monthString = month.toString()

        const day = date.getDate()
        let dayString = day.toString()

        // Pass the month to the valid format
        if (monthString.length === 1) {
            monthString = '0' + monthString
        }

        // Pass the day to the valid format
        if (dayString.length === 1) {
            dayString = '0' + dayString
        }

        return date
        // return `${date.getFullYear()}-${monthString}-${dayString}`
    }

    private getDisease(paqc_10: string) {
        return paqc_10 == '1' ? 'I was feeling bad' : ''
    }

    public fromJSON(q501PhysicalActivityForChildren: Q501PhysicalActivityForChildrenMock): any {
        const JSON = {
            id: q501PhysicalActivityForChildren.id,
            date: q501PhysicalActivityForChildren.date!.toISOString(),
            child_id: q501PhysicalActivityForChildren.child_id,
            a: q501PhysicalActivityForChildren.a,
            b: q501PhysicalActivityForChildren.b,
            c: q501PhysicalActivityForChildren.c,
            d: q501PhysicalActivityForChildren.d,
            e: q501PhysicalActivityForChildren.e,
            f: q501PhysicalActivityForChildren.f,
            gh: q501PhysicalActivityForChildren.gh,
            i: q501PhysicalActivityForChildren.i,
            k: q501PhysicalActivityForChildren.k,
            l: q501PhysicalActivityForChildren.l,
            m: q501PhysicalActivityForChildren.m,
            n: q501PhysicalActivityForChildren.n,
            o: q501PhysicalActivityForChildren.o,
            p: q501PhysicalActivityForChildren.p,
            q: q501PhysicalActivityForChildren.q,
            r: q501PhysicalActivityForChildren.r,
            s: q501PhysicalActivityForChildren.s,
            t: q501PhysicalActivityForChildren.t,
            u: q501PhysicalActivityForChildren.u,
            paqc_2: q501PhysicalActivityForChildren.paqc_2,
            paqc_3: q501PhysicalActivityForChildren.paqc_3,
            paqc_4: q501PhysicalActivityForChildren.paqc_4,
            paqc_5: q501PhysicalActivityForChildren.paqc_5,
            paqc_4br: q501PhysicalActivityForChildren.paqc_4br,
            paqc_5br: q501PhysicalActivityForChildren.paqc_5br,
            paqc_6: q501PhysicalActivityForChildren.paqc_6,
            paqc_6br: q501PhysicalActivityForChildren.paqc_6br,
            paqc_7: q501PhysicalActivityForChildren.paqc_7,
            paqc_8: q501PhysicalActivityForChildren.paqc_8,
            a_7: q501PhysicalActivityForChildren.a_7,
            b_7: q501PhysicalActivityForChildren.b_7,
            c_7: q501PhysicalActivityForChildren.c_7,
            d_7: q501PhysicalActivityForChildren.d_7,
            e_7: q501PhysicalActivityForChildren.e_7,
            f_7: q501PhysicalActivityForChildren.f_7,
            g_7: q501PhysicalActivityForChildren.g_7,
            paqc_10: q501PhysicalActivityForChildren.paqc_10,
            paqc_11: q501PhysicalActivityForChildren.paqc_11,
            percentage: q501PhysicalActivityForChildren.percentage,
            state: q501PhysicalActivityForChildren.state,
            scoring_PAQC: q501PhysicalActivityForChildren.scoring_PAQC
        }

        return JSON
    }
}